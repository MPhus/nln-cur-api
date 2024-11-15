export const mapOrder = (originalArray, orderArray, key) => {
  if (!originalArray || !orderArray || !key) return []

  const clonedArray = [...originalArray]
  const orderedArray = clonedArray.sort((a, b) => {
    return orderArray.indexOf(a[key]) - orderArray.indexOf(b[key])
  })

  return orderedArray
}
export const maxForQuantityAndType = (origin, quantity, type) => {
  let newArray = [...origin]
  const originLength = newArray.length

  for (let i = 0; i < originLength - 1; i++) {
    for (let j = i + 1; j <= originLength - 1; j++) {
      if (newArray[i][type] < newArray[j][type]) {
        let temp = newArray[i]
        newArray[i] = newArray[j]
        newArray[j] = temp
      }
    }
  }
  return newArray.filter((item, index) => index < quantity)
}
