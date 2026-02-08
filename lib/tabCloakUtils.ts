// Utility function to create a solid color favicon as a data URL
export const createSolidColorFavicon = (color: string): string => {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = color
    ctx.fillRect(0, 0, 32, 32)
  }
  return canvas.toDataURL('image/png')
}

export interface CloakOption {
  id: string
  name?: string
  title: string
  bgColor: string
  cssClass: string
  logoUrl?: string
}

export const CLOAK_OPTIONS: CloakOption[] = [
  {
    id: 'google-drive',
    name: 'Google Drive',
    title: 'My Drive - Google Drive',
    bgColor: '#000000', // black background
    cssClass: 'cloak-google-drive',
    logoUrl: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png'
  },
  {
    id: 'canvas',
    name: 'Canvas',
    title: 'Dashboard',
    bgColor: '#1a0000', // dark red background
    cssClass: 'cloak-canvas',
    logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYWy6tLxBPdE65jokTz4cBuyyNGDkupZVdtg&s'
  },
  {
    id: 'classlink',
    name: 'ClassLink',
    title: 'ClassLink LaunchPad',
    bgColor: '#000a14', // dark blue background
    cssClass: 'cloak-classlink',
    logoUrl: 'https://play-lh.googleusercontent.com/ujsa1M8GdT-fo-GfPazpUwgPXVWEOWKUgKZk-SdnUhmcL3opS24MiHe6ypEgqxGpllw'
  },
  {
    id: 'linewize',
    name: 'Linewize',
    title: 'Linewize',
    bgColor: '#000a14', // dark blue background
    cssClass: 'cloak-linewize',
    logoUrl: 'https://gdm-catalog-fmapi-prod.imgix.net/ProductLogo/f23cec1c-1e86-4dc3-9e77-ce04c063ef21.jpeg?w=128&h=128&fit=max&dpr=3&auto=format&q=50'
  },
  {
    id: 'infinite-campus',
    name: 'Infinite Campus',
    title: 'Campus Portal',
    bgColor: '#001a00', // dark green background
    cssClass: 'cloak-infinite-campus',
    logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ42gffXGN4oQVaYZZgITnmDRr-O6sGxYmDaA&s'
  }
]
