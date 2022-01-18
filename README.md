# oss-web-deploy
Deploy web build files to Aliyun Cloud OSS storage

使用前请先将bucket设置为静态网站托管模式，[文档](https://help.aliyun.com/document_detail/31899.html)。

该模块执行以下流程：
1. 将dist目录打包成zip至指定的路径
2. 将zip上传到指定的bucket
3. 请自行在阿里云oss上配置zip解压缩的自动[触发器](https://help.aliyun.com/document_detail/106155.html)

``` ts
import { deploy } from 'oss-web-deploy'
import path from 'path'
import { version } from '../package.json'

const fileName = `${ process.env.NODE_ENV }-myproject-${version}.zip`

deploy({
  distFolderPath: path.resolve('dist'),
  distZipFilePath: path.resolve('.github', fileName),
  buckets: [
    // 国内oss源站
    {
      accessKeyId: process.env.OSS_ID,
      accessKeySecret: process.env.OSS_SECRET,
      bucket: `my-bucket-${ process.env.NODE_ENV }`,
      region: 'oss-cn-beijing',
      secure: true,
      ossFileName: `/deploys/${fileName}`,
    },
    // 海外oss源站
    {
      accessKeyId: process.env.OSS_ID,
      accessKeySecret: process.env.OSS_SECRET,
      bucket: `my-bucket-${ process.env.NODE_ENV }`,
      region: 'oss-cn-hongkong',
      secure: true,
      ossFileName: `/deploys/${fileName}`,
    },
  ],
})


```