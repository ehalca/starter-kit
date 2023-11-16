import { registerAs } from "@nestjs/config";

const KEY = 'domains';

const loader = ()=>({
    appDomain: process.env['APP_URL'],
    nxApiDomain: process.env['NX_API_URL'],
})

export type DomainVariables = {
    [KEY]: ReturnType<typeof loader>
}

export default registerAs(KEY, loader);