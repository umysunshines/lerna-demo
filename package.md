# npm包管理规范

## 包命名规范
采用作用域命名（@+npm用户名）的方式。  
```
// 假设原先的包名如下（采用name-name的规则可以更加的一目了然）
{
  name: 'local-storage'
}
// 改造后，通过 --access=public 方式公有化
{
  name: '@name/local-storage'
}
```

## 版本命名规则

```
x.y.z-[state]
```
* x.y.z 为各版本的序号，遵循 semver 规范
* state 可选字段，表示版本的状态，比如 b 可以表示 beta 测试版

## 语义化版本命名规则
|  序号   | 格式要求  | 说明  |
|  ----  | ----  | ----  |
| x  | 非负整数 | 主版本号(major)，进行不向下兼容的修改时，递增主版本号 |
| y  | 非负整数 | 次版本号(minor)，保持向下兼容，新增特性时，递增次版本号 |
| z  | 非负整数 | 修订号(patch)，保持向下兼容，修复问题但是不影响特性时，递增修订号 |

* 0.y.z 表示开发阶段，非稳定版本，随时可变
* 1.0.0 表示初始稳定版本，后续一切急于此版本进行修改

## 版本状态
|  描述方式   | 说明  | 含义  |
|  ----  | ----  | ----  |
| a  | alpha版 | 内部测试版本，bug多 |
| b  | beta版 | 公测版本，给外部进行测试的版本，有缺陷 |
| rc  | release candidate | 预发版本，解决大部分bug |

## 版本限定
可以理解为 `[范围描述]<版本号描述>`
- `<` 小于某一版本号
- `<=` 小于等于某一版本号
- `>` 大于某一版本号
- `>=` 大于等于某一版本号
- `=` 等于某一版本号，可以不用写
- `~` 基于版本号描述的最新补丁版本（是确保版本兼容性时，默认对补丁号的约束）
- `^` 基于版本号描述的最新兼容版本（是确保版本兼容性时，默认对次版本号的限定约束）
- `-` 某个范围，可以理解成 `<版本描述>-<版本描述>`


## 如何封装一个组件并发布
`Lerna`是一个管理多个npm模块的工具，优化维护多包的工作流，解决多个包互相依赖以及手动发布多个包的问题。
基本的仓库结构如下：
```
lerna-demo/
  |--packages/
    |-- package-a/
      |-- ...
      |-- package.json
    |-- package-b/
      |-- ...
      |-- package.json
  |-- ...
  |-- lerna.json
  |-- package.json
```
* 通过 `lerna create` 创建包
* 通过 `lerna add` 添加依赖
```
# 给所有的 package 添加 lodash 模块
$ lenra add lodash

# 给 package-a 添加 moment 模块
$ lerna add moment --scope package-a

# 内部模块直接依赖添加
$ lerna add package-a --scope package-b
```
* 通过 `lerna boostrap` 安装依赖，可以设置 `--hoist` 来把每个 package 下的相同的依赖包提升到工程的根目录，降低安装以及管理成本
* 通过 `lerna clean` 删除依赖
* 通过 `lerna publish` 发布

## 拓展

`Lerna` 不负责构建，测试之类的任务，只是一种集中管理 package 的模式，提供一套自动化管理程序而已。简而言之，就是可以在项目的根目录就可以掌控到具体组件里的维护。

### 统一提交规范
1. commitizen 和 cz-lerna-changelog
通过 `commitizen` 格式化 `git commit message`，通过询问方式来完成提交信息
```
$ cnpm i -D commitizen
$ cnpm i -D cz-lerna-changelog
```

```
// package.json
{
  "name": "root",
  "private": true,
  "scripts": {
    "c": "git-cz"
  },
  "config": {
    "commitizen": {
      "path": "./node_modules/cz-lerna-changelog"
    }
  },
  "devDependencies": {
    "commitizen": "^3.1.1",
    "cz-lerna-changelog": "^2.0.2",
    "lerna": "^3.15.0"
  }
}
```

2. commitlint 和 husky
对手动的 `git commit -m message` 进行信息的校验，不符合就不让提交，并且提示问题所在。检验的工作是由 `commitlint` 完成，通过 `husky` 来指定校验的时机。
```
# 安装 commitlint 和遵守的规范
$ cnpm i -D @commitlint/cli @commitlint/config-conventional
```

在工程根目录添加 `commitlint.config.js` 为 `commitlint` 指定相应的规范
```js
module.exports = {
  extends: ['@commitlint/config-conventional']
}
```

```
$ cnpm i -D husky
```

```
// 在 package.json 中增加配置
"husky: {
  "hooks": {
    "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
  }
}
```

3. standardjs 和 lint-staged
通过 `linter` 进行代码修正，并且检查暂存区中的文件，对暂存区中的js文件执行 `standard --fix` 校验并且自动修复，用 `husky` 的钩子（`pre-commit`）来执行 `lint-staged` 的校验操作

```
$ cnpm i -D standard lint-staged
```

```
// package.json
{
  "husky: {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.js": [
      "standard --fix",
      "git add"
    ]
  }
}
```

### 生成日志
`lerna publish` 的时候做了哪些事情
1. 找出上一个版本发布以来有变更过的 package
2. 确定要发布的版本号
3. 把所有更新过的package中的package.json的version更新
4. 更新lerna.json中的version字段
5. 提交修改，打tag
6. 推送到git仓库

CHANGELOG是和version一一对应的，所以可以配置参数`--conventional-commits`就可以通过lerna自动生成日志
```
{
  "packages": [
    "packages/*"
  ],
  "command": {
    "bootstrap": {
      "hoist": true
    },
    "version": {
      "conventionalCommits": true
    }
  },
  "ignoreChanges": [
    "**/*.md"
  ],
  "version": "0.0.1-alpha"
}
```

### 编译、打包、调试
采用固定统一的package结构
1. package 入口统一为 index.js
2. package 源码入口统一为 src/index.js
3. package 编译入口统一为 dist/index.js
4. package 统一使用es6语法，通过 Babel，webpack 编译、压缩输出到dist
5. package 发布的时候治发布dist，不发布src
6. package 中注入 LOCAL_DEBUG 环境变量，在index.js区分开发环境和发布环境，调试环境 `require(./src/index)` 保证源码可以调试，发布环境 `require(./dist/index)` 保证源码不被发布


