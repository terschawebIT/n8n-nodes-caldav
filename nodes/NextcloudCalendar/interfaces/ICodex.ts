export interface ICodex {
    type: 'action' | 'string';
    summary: string;
    description?: string;
    examples?: string[];
}

// Erweitere die n8n INodeProperties
declare module 'n8n-workflow' {
    interface INodeProperties {
        codex?: ICodex;
    }

    interface INodePropertyOptions {
        codex?: ICodex;
    }

    interface INodePropertyCollection {
        codex?: ICodex;
    }
}
