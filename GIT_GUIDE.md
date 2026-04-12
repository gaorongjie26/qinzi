
# Git 安装和 GitHub 上传指南

## 1. 安装 Git

### Windows

1. 下载 Git for Windows: https://git-scm.com/download/win
2. 运行安装程序，使用默认设置
3. 安装完成后，重新打开终端

### 验证安装

打开新的终端窗口，运行：

```bash
git --version
```

如果显示版本号，说明安装成功。

## 2. 配置 Git

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 3. 初始化本地仓库

在项目根目录下运行：

```bash
git init
```

## 4. 添加文件到暂存区

```bash
git add .
```

## 5. 创建提交

```bash
git commit -m "Initial commit: 亲子沟通模拟器项目"
```

## 6. 在 GitHub 上创建仓库

1. 访问 https://github.com/new
2. 填写仓库名称（例如：parent-communication-simulator）
3. 选择 Public 或 Private
4. **不要**勾选 "Initialize this repository with a README"
5. 点击 "Create repository"

## 7. 连接到 GitHub 仓库

```bash
git remote add origin https://github.com/你的用户名/仓库名.git
git branch -M main
git push -u origin main
```

## 8. 后续更新

每次修改代码后：

```bash
git add .
git commit -m "描述你的修改"
git push
```

## 注意事项

- `.env.local` 文件已包含在 `.gitignore` 中，不会被上传到 GitHub
- 不要将包含敏感信息的文件（如 API 密钥、数据库密码）提交到 GitHub

