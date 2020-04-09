import {
  log
} from 'test1'

log('测试是否成功', () => {
  setTimeout(() => {
    console.warn('成功了....')
  }, 1000)
})
