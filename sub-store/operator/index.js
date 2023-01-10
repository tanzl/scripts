function operator(proxies, targetPlatform) {
  const _ = lodash

  const host = _.get($arguments, 'host', 'v3-l.bdxiguavod.com') // 西瓜视频
  const hostPrefix = _.get($arguments, 'hostPrefix')
  const hostSuffix = _.get($arguments, 'hostSuffix')
  const port = _.get($arguments, 'port')
  const portPrefix = _.get($arguments, 'portPrefix')
  const portSuffix = _.get($arguments, 'portSuffix')
  const path = _.get($arguments, 'path', '/')
  const method = _.get($arguments, 'method', 'GET')
  const defaultNetwork = _.get($arguments, 'network', 'http')

  return proxies.map((p = {}) => {
    const network = _.get(p, 'network', defaultNetwork)
    const type = _.get(p, 'type')

    /* 只修改 vmess 和 vless */
    if (_.includes(['vmess', 'vless'], type) && network) {

      // vmess-http 设置默认值
      if (network === 'http') {
        _.set(p, 'network', network)
        _.set(p, 'http-opts.path', _.get(p, 'http-opts.path', [path]))
        _.set(p, 'http-opts.method', _.get(p, 'http-opts.method', method))
        _.set(p, 'http-opts.headers.Host', _.get(p, 'http-opts.headers.Host', [host]))
      }

      if (host) {
        if (hostPrefix) {
          _.set(p, 'name', `${hostPrefix}${p.name}`)
        }
        if (hostSuffix) {
          _.set(p, 'name', `${p.name}${hostSuffix}`)
        }

        if (targetPlatform === 'Clash') {
          /* 把 非 server 的部分都设置为 host */
          _.set(p, 'servername', host)
        }

        if (_.get(p, 'tls')) {
          /* skip-cert-verify 在这里设为 true 有需求就再加一个节点操作吧 */
          _.set(p, 'skip-cert-verify', true)
          _.set(p, 'sni', host)
        }

        if (network === 'ws') {
          _.set(p, 'ws-opts.headers.Host', host)
        } else if (network === 'h2') {
          _.set(p, 'h2-opts.host', [host])
        } else if (network === 'http') {
          _.set(p, 'http-opts.headers.Host', [host])
        } else {
          _.set(p, `${network}-opts.headers.Host`, [host])
        }
      }
      if (method && network === 'http') {
        _.set(p, 'http-opts.method', method)
      }

      if (port) {
        _.set(p, 'port', port)
        if (portPrefix) {
          _.set(p, 'name', `${portPrefix}${p.name}`)
        }
        if (portSuffix) {
          _.set(p, 'name', `${p.name}${portSuffix}`)
        }
      }

      if (path && network) {
        if (network === 'ws') {
          _.set(p, 'ws-opts.path', path)
        } else if (network === 'h2') {
          _.set(p, 'h2-opts.path', path)
        } else if (network === 'http') {
          _.set(p, 'http-opts.path', [path])
        } else {
          _.set(p, `${network}-opts.path`, path)
        }
      }
    } else if ('ss' === type) {
      if (host) {
        const plugin = _.get(p, 'plugin')
        if (plugin === 'obfs') {
          _.set(p, 'plugin-opts.host', host)
        }
      }
    } else if ('trojan' === type) {
      if (host) {
        _.set(p, 'sni', host)
      }
    }
    return p
  })
}