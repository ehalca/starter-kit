
export const getAppUrl = ()=> {
    return new URL(process.env['APP_URL']!);
}

export const getNxApiUrl = ()=> {
    return new URL(process.env['NX_API_URL']!);
}
