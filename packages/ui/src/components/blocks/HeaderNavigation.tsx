import { Book, Github } from "lucide-react";

interface HeaderNavigationProps {
  exampleDirName?: string;
}

export function HeaderNavigation({ exampleDirName }: HeaderNavigationProps) {
  return (
    <div className="flex justify-between items-center mt-6">
      <div className="flex-shrink-0 flex items-center">
        <a
          href="https://airtop.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block"
          aria-label="Airtop Homepage"
        >
          <img src="/airtop_logo_no_blur.svg" className="w-29" alt="Airtop Logo" />
        </a>
      </div>

      <div className="flex items-center gap-4">
        <a
          href="https://docs.airtop.ai/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-80"
          aria-label="Airtop Documentation"
        >
          <Book />
        </a>
        <a
          href={
            exampleDirName
              ? `https://github.com/airtop-ai/examples/tree/main/examples/${exampleDirName}`
              : "https://github.com/airtop-ai/examples"
          }
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-80"
          aria-label="Airtop GitHub Examples"
        >
          <Github />
        </a>
      </div>
    </div>
  );
}
