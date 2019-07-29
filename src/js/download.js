export default function(payload, encoding, filename) {
  // Murder this when ie11 dies
  if (window.navigator.msSaveBlob) {
    const blob = new Blob([payload], { type: encoding })
    navigator.msSaveBlob(blob, filename)
  } else {
    const downloadLink = document.createElement('a')

    downloadLink.href = `${encoding}base64,${btoa(payload)}`
    downloadLink.download = `${filename}`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }
}
