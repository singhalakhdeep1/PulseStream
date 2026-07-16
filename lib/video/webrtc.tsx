import { RoomServiceClient } from 'livekit-server-sdk'

const client = new RoomServiceClient(
  process.env.LIVEKIT_URL || 'wss://livekit-server',
  process.env.LIVEKIT_API_KEY || '',
  process.env.LIVEKIT_API_SECRET || ''
)

export interface Room {
  sid: string
  name: string
  numParticipants: number
  maxParticipants: number
  creationTime: number
}

export async function createRoom(roomName: string, maxParticipants: number = 10): Promise<Room> {
  const room = await client.createRoom({
    name: roomName,
    emptyTimeout: 10 * 60, // 10 minutes
    maxParticipants,
  })

  return {
    sid: room.sid,
    name: room.name,
    numParticipants: room.num_participants,
    maxParticipants: room.max_participants,
    creationTime: room.creation_time,
  }
}

export async function getRoom(roomName: string): Promise<Room | null> {
  try {
    const room = await client.getRoom(roomName)
    return {
      sid: room.sid,
      name: room.name,
      numParticipants: room.num_participants,
      maxParticipants: room.max_participants,
      creationTime: room.creation_time,
    }
  } catch (error) {
    console.error('Error retrieving room:', error)
    return null
  }
}

export async function deleteRoom(roomName: string): Promise<void> {
  try {
    await client.deleteRoom(roomName)
  } catch (error) {
    console.error('Error deleting room:', error)
  }
}

export async function listRooms(): Promise<Room[]> {
  try {
    const rooms = await client.listRooms()
    return rooms.map(room => ({
      sid: room.sid,
      name: room.name,
      numParticipants: room.num_participants,
      maxParticipants: room.max_participants,
      creationTime: room.creation_time,
    }))
  } catch (error) {
    console.error('Error listing rooms:', error)
    return []
  }
}
