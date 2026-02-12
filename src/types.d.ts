declare module '@console/console-platform-log4js-utils' {
    import { Logger } from 'log4js'
    export function getLogger(categoryName: string) : Logger
}