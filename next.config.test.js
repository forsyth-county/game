module.exports = {
  "eslint": {
    "ignoreDuringBuilds": true
  },
  "output": "export",
  "basePath": "/portal",
  "assetPrefix": "/portal",
  "env": {
    "NEXT_PUBLIC_BASE_PATH": "",
    "NEXT_PUBLIC_IS_GITHUB_PAGES": "false"
  },
  "images": {
    "unoptimized": false,
    "remotePatterns": [
      {
        "protocol": "https",
        "hostname": "**"
      }
    ]
  },
  "trailingSlash": true,
  "skipTrailingSlashRedirect": true
}