export interface DRMConfig {
  widevine?: {
    licenseServerUrl: string
    keyId: string
    key: string
  }
  fairplay?: {
    licenseServerUrl: string
    keyId: string
    key: string
  }
  playready?: {
    licenseServerUrl: string
    keyId: string
    key: string
  }
}

export function generateDRMHeaders(config: DRMConfig, drmType: 'widevine' | 'fairplay' | 'playready') {
  const headers: Record<string, string> = {}

  if (drmType === 'widevine' && config.widevine) {
    headers['X-Widevine-License-Server-URL'] = config.widevine.licenseServerUrl
    headers['X-Widevine-Key-Id'] = config.widevine.keyId
  } else if (drmType === 'fairplay' && config.fairplay) {
    headers['X-FairPlay-License-Server-URL'] = config.fairplay.licenseServerUrl
    headers['X-FairPlay-Key-Id'] = config.fairplay.keyId
  } else if (drmType === 'playready' && config.playready) {
    headers['X-PlayReady-License-Server-URL'] = config.playready.licenseServerUrl
    headers['X-PlayReady-Key-Id'] = config.playready.keyId
  }

  return headers
}

export function getDRMLicenseUrl(config: DRMConfig, drmType: 'widevine' | 'fairplay' | 'playready'): string {
  if (drmType === 'widevine' && config.widevine) {
    return config.widevine.licenseServerUrl
  } else if (drmType === 'fairplay' && config.fairplay) {
    return config.fairplay.licenseServerUrl
  } else if (drmType === 'playready' && config.playready) {
    return config.playready.licenseServerUrl
  }
  return ''
}

export function detectDRMSupport(): {
  widevine: boolean
  fairplay: boolean
  playready: boolean
} {
  if (typeof window === 'undefined') {
    return { widevine: false, fairplay: false, playready: false }
  }

  const video = document.createElement('video')
  
  return {
    widevine: video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"') !== '',
    fairplay: video.webkitKeys !== undefined,
    playready: video.msKeys !== undefined,
  }
}
