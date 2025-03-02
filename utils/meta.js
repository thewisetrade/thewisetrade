export const buildPageMeta = (title, description, path, imgPath) => [
    { name: 'description', content: description },
    { name: 'og:description', content: description},
    { name: 'og:title', content: 'The Wise Trade - ' + title },
    { name: 'og:type', content: 'website' },
    { name: 'og:url', content: 'https://thewise.trade/' + path},
    { name: 'og:image', content: imgPath
      ? 'https://thewise.trade/illustrations/' + imgPath
      : 'https://thewise.trade/illustrations/logo.png',
    },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description},
    { name: 'twitter:url', content: 'https://thewise.trade/' + path},
    { name: 'twitter:image', content: imgPath
      ? 'https://thewise.trade/illustrations/' + imgPath
      : 'https://thewise.trade/illustrations/logo.png'
    },
    { name: 'twitter:card', content: 'summary_large_image' }
]
