# Electron for Vue vben admin

## 简介

使用electron 打包 Vue Vben Admin；

main分支使用electron-forge来打包，但是由于项目使用pnpm管理包，目前electron-forge打包时会有找不到本地包的问题；截止2024/6/13，forge官方还未支持pnpm；

electron-builder分支使用electron-builder来打包，在mac-arm64上打包成功，不少细节还需优化.

## 参照

[MaaX](https://github.com/MaaAssistantArknights/MaaX)
