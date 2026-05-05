export const apiFetch = async (url, option = {}) =>{
    const res = await fetch(url,{
        ...option,
        headers:{
            'Content-Type': 'application/json',
            ...option.headers
        }
    })

    return res.json();
}