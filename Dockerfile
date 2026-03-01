# 使用官方Node.js镜像
FROM node:18-alpine

# 设置npm淘宝镜像加速
RUN npm config set registry https://registry.npmmirror.com

# 创建工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制所有文件
COPY . .

# 暴露端口
EXPOSE 3000

# 启动服务器
CMD ["npm", "start"]