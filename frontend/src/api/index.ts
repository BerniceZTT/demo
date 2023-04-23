import axios from 'axios'
import dayjs from 'dayjs'
import { Notification, Message } from '@arco-design/web-react'

export interface BaseResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

export const redirecting = "redirecting"

axios.interceptors.request.use(
  config => {
    const urlParams = Object.fromEntries(new URLSearchParams(window.location.search).entries())
    if (!(document.getElementById('env-sdk') && document.getElementById('env-sdk')?.tagName === 'SCRIPT')) {
      if (config.headers && !config.headers['x-tt-env']) {
        config.headers['x-tt-env'] = urlParams['x-tt-env']
      }
    }
    config.headers && Object.assign(config.headers, { 'App-Language': 'zh-CN' })
    return config
  },
  error => Promise.reject(error)
)

axios.interceptors.response.use(resp => {
  const code = resp.status;
  if (code !== 200 && code !== 400) {
    return Promise.reject(resp.statusText)
  }
  const data: BaseResponse = resp.data
  if (data.code === 0) {
    return Promise.resolve(data.data);
  }
  if (data.code === 401 && data.data) {
    const windowTop = window.top || parent
    if (windowTop.location.href === location.href) {
      location.href = data.data
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
    // 防止UI层直接返回一个报错信息
    return new Promise(() => setTimeout(() => { }, 2000))
  }

  // pathMessage.includes(resp.config?.url || '') && Message[codeStatus(resp.data?.code)](codeMessage[resp.data?.code])
  return Promise.reject(data);
}, err => {
  console.error(err)
  Notification.error({ title: "出错了", content: err })
  console.error(err);
})
