const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // 提供静态文件

// 数据库初始化
const db = new sqlite3.Database('./tasks.db', (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
  } else {
    console.log('已连接到SQLite数据库');
    initializeDatabase();
  }
});

// 初始化数据库表
function initializeDatabase() {
  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT CHECK(priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
    due_date TEXT,
    due_time TEXT,
    reminder BOOLEAN DEFAULT 0,
    completed BOOLEAN DEFAULT 0,
    tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('创建tasks表失败:', err.message);
    } else {
      console.log('tasks表已就绪');
    }
  });
}

// API路由

// 获取所有任务
app.get('/api/tasks', (req, res) => {
  const { completed, priority, search } = req.query;
  let query = 'SELECT * FROM tasks WHERE 1=1';
  const params = [];

  if (completed !== undefined) {
    query += ' AND completed = ?';
    params.push(completed === 'true' ? 1 : 0);
  }

  if (priority) {
    query += ' AND priority = ?';
    params.push(priority);
  }

  if (search) {
    query += ' AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 获取单个任务
app.get('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: '任务不存在' });
      return;
    }
    res.json(row);
  });
});

// 创建新任务
app.post('/api/tasks', (req, res) => {
  const { title, description, priority, due_date, due_time, reminder, completed, tags } = req.body;
  
  if (!title) {
    res.status(400).json({ error: '标题不能为空' });
    return;
  }

  const sql = `INSERT INTO tasks (title, description, priority, due_date, due_time, reminder, completed, tags) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [title, description || '', priority || 'medium', due_date || '', due_time || '', 
                  reminder ? 1 : 0, completed ? 1 : 0, tags || ''];

  db.run(sql, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json(row);
    });
  });
});

// 更新任务
app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, priority, due_date, due_time, reminder, completed, tags } = req.body;

  const sql = `UPDATE tasks 
               SET title = ?, description = ?, priority = ?, due_date = ?, due_time = ?, 
                   reminder = ?, completed = ?, tags = ?, updated_at = CURRENT_TIMESTAMP 
               WHERE id = ?`;
  const params = [title, description, priority, due_date, due_time, 
                  reminder ? 1 : 0, completed ? 1 : 0, tags, id];

  db.run(sql, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: '任务不存在' });
      return;
    }
    db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(row);
    });
  });
});

// 删除任务
app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: '任务不存在' });
      return;
    }
    res.json({ success: true, message: '任务已删除' });
  });
});

// 获取统计信息
app.get('/api/stats', (req, res) => {
  const stats = {};

  // 总任务数
  db.get('SELECT COUNT(*) as total FROM tasks', (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    stats.total = row.total;

    // 已完成任务数
    db.get('SELECT COUNT(*) as completed FROM tasks WHERE completed = 1', (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      stats.completed = row.completed;

      // 高优先级任务数
      db.get('SELECT COUNT(*) as highPriority FROM tasks WHERE priority = "high" AND completed = 0', (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        stats.highPriority = row.highPriority;

        // 今日任务数
        const today = new Date().toISOString().split('T')[0];
        db.get('SELECT COUNT(*) as todayTasks FROM tasks WHERE due_date = ? AND completed = 0', [today], (err, row) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          stats.todayTasks = row.todayTasks || 0;

          // 本周任务数
          const now = new Date();
          const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          
          const startDate = startOfWeek.toISOString().split('T')[0];
          const endDate = endOfWeek.toISOString().split('T')[0];
          
          db.get('SELECT COUNT(*) as weekTasks FROM tasks WHERE due_date BETWEEN ? AND ? AND completed = 0', 
            [startDate, endDate], (err, row) => {
              if (err) {
                res.status(500).json({ error: err.message });
                return;
              }
              stats.weekTasks = row.weekTasks || 0;
              res.json(stats);
            });
        });
      });
    });
  });
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 提供前端页面
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'task-reminder.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

// 优雅关闭
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('数据库关闭失败:', err.message);
    } else {
      console.log('数据库连接已关闭');
    }
    process.exit(0);
  });
});