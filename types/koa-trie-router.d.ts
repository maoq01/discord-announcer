export = index;
declare class index {
    methods: any;
    trie: any;
    get: any;
    addRoute(method: any, paths: any, middleware: any): any;
    isImplementedMethod(method: any): any;
    loadRoutes(): void;
    middleware(): any;
    use(middleware: any): any;
}
