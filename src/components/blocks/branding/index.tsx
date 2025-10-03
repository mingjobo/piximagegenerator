import { Section as SectionType } from "@/types/blocks/section";

export default function Branding({ section }: { section: SectionType }) {
  if (section.disabled) {
    return null;
  }

  // Duplicate items for seamless scrolling
  const duplicatedItems = section.items ? [...section.items, ...section.items] : [];

  return (
    <section id={section.name} className="mt-8 border-t pt-8">
      <div className="relative w-full overflow-hidden">
        <div className="flex animate-scroll-horizontal">
          {duplicatedItems?.map((item, idx) => {
            const content = item.image ? (
              <img
                src={item.image.src}
                alt={item.image.alt || item.title}
                height={54}
                className="max-h-14 object-contain dark:invert"
              />
            ) : null;

            if (item.url && content) {
              return (
                <div key={idx} className="flex-shrink-0 px-8 md:px-12 lg:px-16">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    {content}
                  </a>
                </div>
              );
            }

            if (content) {
              return (
                <div key={idx} className="flex-shrink-0 px-8 md:px-12 lg:px-16">
                  {content}
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    </section>
  );
}