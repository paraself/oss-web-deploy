import { zip } from 'zip-a-folder'
import retry from 'async-retry'
import OSS from 'ali-oss'

async function upload(distZipFilePath: string, params: IDeployBucket) {
  console.log('Uploading to :', params.bucket)
  params.secure = true
  const ossClient = new OSS(params)
  let headers: { [key: string]: string } = {}
  if (params.tagging) {
    headers['x-oss-tagging'] = Object.entries(params.tagging)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')
  }
  const res = await retry(
    () =>
      ossClient
        .put(params.ossFileName, distZipFilePath, { headers })
        .then((result) => {
          if (result.res.status !== 200) {
            throw new Error(JSON.stringify(result))
          } else return result
        }),
    { retries: 5, maxTimeout: 10000 }
  )
  console.log('Uploaded as:', res.name)
  console.log('Url: ', res.url)
}

export type IDeployBucket = OSS.Options & {
  /** 文件上传到oss的文件名 */
  ossFileName: string
  /** 文件的标签 */
  tagging?: { [key: string]: any }
}

export interface IDeployConfig {
  /** 前端构建的dist目录 */
  distFolderPath: string
  /** 将dist进行zip压缩之后的文件路径 */
  distZipFilePath: string
  /** 需要上传的buckets */
  buckets: IDeployBucket[]
}

export async function deploy(params: IDeployConfig) {
  console.log('Compressing dist folder: ', params.distFolderPath)
  await zip(params.distFolderPath, params.distZipFilePath)
  console.log('Compressed dist folder to file: ', params.distZipFilePath)
  for (let i = 0; i < params.buckets.length; i++) {
    console.log('----------------------------')
    await upload(params.distZipFilePath, params.buckets[i])
  }
  console.log('----------------------------')
  console.log('All done!')
}
