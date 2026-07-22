const fetchPoolsData = async () => {
  const response = await fetch('https://api.tokleo.com/api/public/pools', {
    headers: {
      'X-Public-Key': 'Daisy-Uncouth-Chrome-Demanding-Freight-Boxcar6',
    },
  })
  const data = await response.json()
  return data.pools
}

export { fetchPoolsData }
