import { DocCategory, DocCategoryId } from './doc.model';

export const CATEGORIES: Record<DocCategoryId, DocCategory> = {
    components: {
        id: 'components',
        title: 'Components',
        description: 'Form controls, actions and display pieces — each with a live playground.',
        emptyTitle: 'Components are on the way',
        emptyText: 'Follow the changelog to hear when the first ones land.',
    },
    directives: {
        id: 'directives',
        title: 'Directives',
        description: 'Behaviour you can attach to any element with a single attribute.',
        emptyTitle: 'Directives are on the way',
        emptyText:
            "We're shipping the core components first. Directives like abAutofocus will land here — follow the changelog to hear first.",
    },
    pipes: {
        id: 'pipes',
        title: 'Pipes',
        description: 'Template-friendly value transforms for text, numbers and dates.',
        emptyTitle: 'Pipes are on the way',
        emptyText:
            "Formatting helpers such as truncate are next on the roadmap. Preview the page template we'll use for them.",
    },
};

export const CATEGORY_ORDER: readonly DocCategoryId[] = ['components', 'directives', 'pipes'];
