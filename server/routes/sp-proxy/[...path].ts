export default defineEventHandler(async (event) => {
    const path = getRouterParam(event, 'path')
    const token = getHeader(event, 'x-sp-token')
    return $fetch(`https://api.apparyllis.com/v1/${path}`, {
        headers: { Authorization: token ?? '' }
    })
})