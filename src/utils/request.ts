import { Message } from '@arco-design/web-react'
import axios from 'axios'
import dayjs from 'dayjs'


export interface Res<T = any> {
  code: number
  data: T
  msg: string
}

const controller = new AbortController()

const service = axios.create({
  signal: controller.signal,
  baseURL: '/api',
  timeout: 6e4
})

service.interceptors.request.use(
  config => {
    const urlParams = Object.fromEntries(new URLSearchParams(window.location.search).entries())
    if (urlParams['x-tt-env']) {
      if (!(document.getElementById('env-sdk') && document.getElementById('env-sdk')?.tagName === 'SCRIPT')) {
        if (config.headers && !config.headers['x-tt-env']) {
          config.headers['x-tt-env'] = urlParams['x-tt-env']
        }
      }
    }
    config.headers && Object.assign(config.headers, { 'App-Language': 'zh-CN' })
    return config
  },
  error => Promise.reject(error)
)

service.interceptors.response.use(
  response => {
    const res: Res = response.data
    if (res.code === 401 && res.data) {
      const windowTop = window.top || parent
      if (windowTop.location.href === location.href) {
        location.href = res.data
      } else {
        if (dayjs().unix() - (Number(localStorage.getItem('nexus-reload-delay')) || 0) > 8.64e4) {
          localStorage.setItem('nexus-reload-delay', String(dayjs().unix()));
          windowTop.location.reload()
        } else {
          Message.error('登陆状态失效，请刷新重试！')
          window?.['Slardar' as any] && (window['Slardar' as any] as any)('sendEvent', {
            name: 'nexus_iframe_401',
            type: 'event',
            metrics: { count: 1 },
            category: { prev: localStorage.getItem('nexus-reload-delay'), next: dayjs().unix() }
          })
        }
      }
      // 取消请求
      controller.abort()
      return new Promise(() => {})
    }
    return res
  },
  error => {
    // Message.error("网络请求超时！，请稍后重试。");
    console.log("接口响应报错:", error);
    Promise.reject(error)
  }
)

export default service
