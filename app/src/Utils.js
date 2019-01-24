export const capitalize = (s) => {
  return s && s.split(' ').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
}