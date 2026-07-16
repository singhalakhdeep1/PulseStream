import { Mux } from '@mux/mux-node'

const mux = new Mux({
  accessTokenId: process.env.MUX_ACCESS_TOKEN_ID,
  secretKey: process.env.MUX_SECRET_KEY,
})

export interface StreamAsset {
  id: string
  playbackId: string
  status: string
  duration: number
  createdAt: Date
}

export async function createStream(videoUrl: string): Promise<StreamAsset> {
  const asset = await mux.video.assets.create({
    input: videoUrl,
    playback_policy: 'public',
    mp4_support: 'standard',
  })

  return {
    id: asset.id,
    playbackId: asset.playback_ids?.[0]?.id || '',
    status: asset.status,
    duration: asset.duration || 0,
    createdAt: new Date(asset.created_at),
  }
}

export async function getStreamAsset(assetId: string): Promise<StreamAsset | null> {
  try {
    const asset = await mux.video.assets.retrieve(assetId)
    return {
      id: asset.id,
      playbackId: asset.playback_ids?.[0]?.id || '',
      status: asset.status,
      duration: asset.duration || 0,
      createdAt: new Date(asset.created_at),
    }
  } catch (error) {
    console.error('Error retrieving stream asset:', error)
    return null
  }
}

export async function deleteStreamAsset(assetId: string): Promise<void> {
  try {
    await mux.video.assets.delete(assetId)
  } catch (error) {
    console.error('Error deleting stream asset:', error)
  }
}

export async function createLiveStream() {
  const stream = await mux.video.liveStreams.create({
    playback_policy: 'public',
    new_asset_settings: {
      playback_policy: 'public',
    },
  })

  return {
    streamId: stream.id,
    streamKey: stream.stream_key,
    playbackId: stream.playback_ids?.[0]?.id || '',
  }
}

export async function getLiveStream(streamId: string) {
  try {
    const stream = await mux.video.liveStreams.retrieve(streamId)
    return {
      streamId: stream.id,
      status: stream.status,
      playbackId: stream.playback_ids?.[0]?.id || '',
    }
  } catch (error) {
    console.error('Error retrieving live stream:', error)
    return null
  }
}
