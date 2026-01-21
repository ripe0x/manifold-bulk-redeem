import type { Metadata } from '../types'

export async function fetchMetadata(
  location: string,
  storageProtocol: number
): Promise<Metadata | null> {
  try {
    let url: string
    if (storageProtocol === 2) {
      // Arweave
      url = `https://arweave.net/${location}`
    } else if (storageProtocol === 1) {
      // IPFS
      url = `https://ipfs.io/ipfs/${location}`
    } else {
      return null
    }

    const response = await fetch(url)
    const metadata = await response.json()
    return metadata
  } catch (e) {
    console.error('Error fetching metadata:', e)
    return null
  }
}

export function getImageUrl(metadata: Metadata | null): string | undefined {
  if (!metadata) return undefined
  const imageUri = metadata.image || metadata.image_url
  if (!imageUri) return undefined

  // Convert IPFS/Arweave URIs to HTTP URLs
  if (imageUri.startsWith('ipfs://')) {
    return `https://ipfs.io/ipfs/${imageUri.slice(7)}`
  }
  if (imageUri.startsWith('ar://')) {
    return `https://arweave.net/${imageUri.slice(5)}`
  }
  return imageUri
}
