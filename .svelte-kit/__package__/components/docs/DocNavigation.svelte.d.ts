interface NavDoc {
    title: string;
    slug: string;
}
interface Props {
    previousDoc?: NavDoc;
    nextDoc?: NavDoc;
    version: string;
}
declare const DocNavigation: import("svelte").Component<Props, {}, "">;
type DocNavigation = ReturnType<typeof DocNavigation>;
export default DocNavigation;
