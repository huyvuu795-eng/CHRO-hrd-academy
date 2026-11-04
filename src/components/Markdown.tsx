import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-stone max-w-none prose-headings:scroll-mt-20 prose-h1:text-2xl prose-h1:leading-tight prose-h2:mt-8 prose-h2:text-xl prose-h3:text-base prose-p:leading-relaxed prose-li:my-0.5 prose-table:text-sm prose-th:bg-stone-100 prose-th:px-2 prose-td:px-2 prose-blockquote:border-brand-600 prose-blockquote:font-normal prose-blockquote:not-italic dark:prose-invert dark:prose-th:bg-stone-800">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => (
            <div className="-mx-1 overflow-x-auto">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
