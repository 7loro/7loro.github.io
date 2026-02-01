import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateSlug,
  isPublishable,
  filterPublishable,
  extractDate,
  buildPublishedIndex,
  processWikilinks,
  extractSummaryFromCallout,
  processCallouts,
  processDocument,
  generateFrontmatter,
  findImageReferences,
  findImageFile,
  transformImagePaths,
  processImages,
  cleanupUnusedImages,
  type ParsedDocument,
  type PublishableDocument,
  type ImageReference,
} from '../sync.ts';

function createMockDoc(overrides: Partial<ParsedDocument> = {}): ParsedDocument {
  return {
    slug: 'test-doc',
    title: 'Test Doc',
    date: new Date('2024-01-15'),
    modified: new Date('2024-01-15'),
    content: 'Test content',
    frontmatter: { publish: true },
    filePath: '/source/test-doc.md',
    ...overrides,
  };
}

describe('generateSlug', () => {
  it('should convert title to lowercase slug', () => {
    expect(generateSlug('/path/file.md', 'Hello World')).toBe('hello-world');
  });

  it('should handle korean characters', () => {
    expect(generateSlug('/path/file.md', '안녕하세요')).toBe('안녕하세요');
  });

  it('should remove special characters', () => {
    expect(generateSlug('/path/file.md', 'Hello! World?')).toBe('hello-world');
  });

  it('should fallback to filename if no title', () => {
    expect(generateSlug('/path/my-document.md')).toBe('my-document');
  });

  it('should collapse multiple spaces/dashes', () => {
    expect(generateSlug('/path/file.md', 'Hello   World')).toBe('hello-world');
  });
});

describe('isPublishable', () => {
  it('should return true for publish:true documents', () => {
    const doc = createMockDoc({ frontmatter: { publish: true } });
    expect(isPublishable(doc)).toBe(true);
  });

  it('should return false for publish:false documents', () => {
    const doc = createMockDoc({ frontmatter: { publish: false } });
    expect(isPublishable(doc)).toBe(false);
  });

  it('should return false if publish is not set', () => {
    const doc = createMockDoc({ frontmatter: {} });
    expect(isPublishable(doc)).toBe(false);
  });

  it('should return true for publish:"true" (string)', () => {
    const doc = createMockDoc({ frontmatter: { publish: 'true' } });
    expect(isPublishable(doc)).toBe(true);
  });
});

describe('filterPublishable', () => {
  it('should filter only publish:true documents', () => {
    const docs = [
      createMockDoc({ title: 'Doc1', frontmatter: { publish: true } }),
      createMockDoc({ title: 'Doc2', frontmatter: { publish: false } }),
      createMockDoc({ title: 'Doc3', frontmatter: { publish: true } }),
      createMockDoc({ title: 'Doc4', frontmatter: {} }),
    ];
    const result = filterPublishable(docs);
    expect(result).toHaveLength(2);
    expect(result.map(d => d.title)).toEqual(['Doc1', 'Doc3']);
  });
});

describe('extractDate', () => {
  it('should extract date from frontmatter', () => {
    const doc = createMockDoc({ date: new Date('2024-06-15') });
    expect(extractDate(doc).toISOString()).toBe('2024-06-15T00:00:00.000Z');
  });

  it('should use created as fallback', () => {
    const doc = createMockDoc({ date: new Date('2024-03-10') });
    expect(extractDate(doc).toISOString()).toBe('2024-03-10T00:00:00.000Z');
  });
});

describe('buildPublishedIndex', () => {
  it('should index by title', () => {
    const docs = [createMockDoc({ title: 'My Document', slug: 'my-document' })];
    const index = buildPublishedIndex(docs);
    expect(index.get('My Document')).toBeDefined();
  });

  it('should index by slug', () => {
    const docs = [createMockDoc({ title: 'My Document', slug: 'my-document' })];
    const index = buildPublishedIndex(docs);
    expect(index.get('my-document')).toBeDefined();
  });

  it('should index by aliases', () => {
    const docs = [createMockDoc({
      title: 'My Document',
      slug: 'my-document',
      frontmatter: { publish: true, aliases: ['Alias1', 'Alias2'] },
    })];
    const index = buildPublishedIndex(docs);
    expect(index.get('Alias1')).toBeDefined();
    expect(index.get('Alias2')).toBeDefined();
  });
});

describe('processWikilinks', () => {
  let publishedIndex: Map<string, ParsedDocument>;
  let currentDoc: ParsedDocument;

  beforeEach(() => {
    const publishedDoc = createMockDoc({ title: 'Published Doc', slug: 'published-doc' });
    publishedIndex = new Map([
      ['Published Doc', publishedDoc],
      ['published-doc', publishedDoc],
    ]);
    currentDoc = createMockDoc({ title: 'Current Doc' });
  });

  it('should convert wikilinks to published docs', () => {
    const content = 'Link to [[Published Doc]]';
    const { content: result, warnings } = processWikilinks(content, publishedIndex, currentDoc);
    expect(result).toBe('Link to <a href="/posts/published-doc">Published Doc</a>');
    expect(warnings).toHaveLength(0);
  });

  it('should handle display text in wikilinks', () => {
    const content = '[[Published Doc|Click here]]';
    const { content: result } = processWikilinks(content, publishedIndex, currentDoc);
    expect(result).toBe('<a href="/posts/published-doc">Click here</a>');
  });

  it('should warn on broken internal links', () => {
    const content = 'Link to [[Unpublished Doc]]';
    const { content: result, warnings } = processWikilinks(content, publishedIndex, currentDoc);
    expect(result).toBe('Link to Unpublished Doc');
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('Unpublished Doc');
    expect(warnings[0]).toContain('is not a published document');
  });

  it('should convert wikilinks to text for unpublished docs', () => {
    const content = 'See [[Private Note]] for details';
    const { content: result } = processWikilinks(content, publishedIndex, currentDoc);
    expect(result).toBe('See Private Note for details');
  });

  it('should handle multiple wikilinks', () => {
    const content = '[[Published Doc]] and [[Missing]]';
    const { content: result, warnings } = processWikilinks(content, publishedIndex, currentDoc);
    expect(result).toBe('<a href="/posts/published-doc">Published Doc</a> and Missing');
    expect(warnings).toHaveLength(1);
  });
});

describe('processCallouts', () => {
  it('should parse simple callouts correctly', () => {
    const content = `> [!NOTE]
> This is a note`;
    const result = processCallouts(content);
    expect(result).toContain('class="callout callout-note"');
    expect(result).toContain('This is a note');
  });

  it('should handle callout with custom title', () => {
    const content = `> [!WARNING] Important!
> Be careful`;
    const result = processCallouts(content);
    expect(result).toContain('class="callout callout-warning"');
    expect(result).toContain('Important!');
    expect(result).toContain('Be careful');
  });

  it('should handle INFO callout type', () => {
    const content = `> [!INFO]
> Some info`;
    const result = processCallouts(content);
    expect(result).toContain('callout-info');
  });

  it('should handle multiline callout content', () => {
    const content = `> [!TIP]
> Line 1
> Line 2
> Line 3`;
    const result = processCallouts(content);
    expect(result).toContain('Line 1');
    expect(result).toContain('Line 2');
    expect(result).toContain('Line 3');
  });

  it('should end callout at non-quoted line', () => {
    const content = `> [!NOTE]
> Note content

Regular text`;
    const result = processCallouts(content);
    expect(result).toContain('callout-note');
    expect(result).toContain('Regular text');
  });
});

describe('extractSummaryFromCallout', () => {
  it('should extract summary from SUMMARY callout', () => {
    const content = `> [!SUMMARY]
> This is the summary text`;
    const result = extractSummaryFromCallout(content);
    expect(result).toBe('This is the summary text');
  });

  it('should handle lowercase summary callout', () => {
    const content = `> [!summary]
> Lowercase summary`;
    const result = extractSummaryFromCallout(content);
    expect(result).toBe('Lowercase summary');
  });

  it('should join multiline summary into single line', () => {
    const content = `> [!SUMMARY]
> Line one
> Line two`;
    const result = extractSummaryFromCallout(content);
    expect(result).toBe('Line one Line two');
  });

  it('should return null if no summary callout', () => {
    const content = `> [!NOTE]
> This is a note`;
    const result = extractSummaryFromCallout(content);
    expect(result).toBeNull();
  });

  it('should return null for empty content', () => {
    const result = extractSummaryFromCallout('');
    expect(result).toBeNull();
  });

  it('should stop at next callout', () => {
    const content = `> [!SUMMARY]
> Summary text
> [!NOTE]
> Note text`;
    const result = extractSummaryFromCallout(content);
    expect(result).toBe('Summary text');
  });
});

describe('processDocument', () => {
  it('should process wikilinks and callouts together', () => {
    const publishedDoc = createMockDoc({ title: 'Other Doc', slug: 'other-doc' });
    const publishedIndex = new Map([
      ['Other Doc', publishedDoc],
      ['other-doc', publishedDoc],
    ]);
    
    const doc = createMockDoc({
      content: `Link to [[Other Doc]]

> [!NOTE]
> Important info`,
    });

    const { document, warnings } = processDocument(doc, publishedIndex);
    expect(document.processedContent).toContain('<a href="/posts/other-doc">Other Doc</a>');
    expect(document.processedContent).toContain('callout-note');
    expect(warnings).toHaveLength(0);
  });
});

describe('generateFrontmatter', () => {
  it('should generate valid frontmatter', () => {
    const doc: PublishableDocument = {
      ...createMockDoc({
        title: 'Test Title',
        date: new Date('2024-01-15'),
        frontmatter: { publish: true, tags: ['tag1', 'tag2'], summary: 'A test' },
      }),
      processedContent: '',
    };
    
    const result = generateFrontmatter(doc);
    expect(result).toContain('title: Test Title');
    expect(result).toContain('date:');
    expect(result).toContain('tags:');
    expect(result).toContain('- tag1');
    expect(result).toContain('summary: "A test"');
  });

  it('should handle optional fields', () => {
    const doc: PublishableDocument = {
      ...createMockDoc({
        title: 'Simple',
        frontmatter: { publish: true },
      }),
      processedContent: '',
    };
    
    const result = generateFrontmatter(doc);
    expect(result).toContain('title: Simple');
    expect(result).not.toContain('tags:');
    expect(result).not.toContain('summary:');
  });
});

describe('image copy', () => {
  it('should detect ![[image.png]] patterns', () => {
    const content = 'Text with ![[image.png]] and ![[photo.jpg]]';
    const images = findImageReferences(content);
    expect(images).toHaveLength(2);
    expect(images[0]).toEqual({ filename: 'image.png', width: undefined });
    expect(images[1]).toEqual({ filename: 'photo.jpg', width: undefined });
  });

  it('should detect ![[image.png|width]] patterns with width', () => {
    const content = '![[CleanShot 2026-02-01 at 01.13.25@2x.png|675]]';
    const images = findImageReferences(content);
    expect(images).toHaveLength(1);
    expect(images[0]).toEqual({ filename: 'CleanShot 2026-02-01 at 01.13.25@2x.png', width: 675 });
  });

  it('should detect various image formats', () => {
    const content = '![[test.png]] ![[photo.jpg]] ![[diagram.gif]]';
    const images = findImageReferences(content);
    expect(images).toHaveLength(3);
    expect(images.map(i => i.filename)).toContain('test.png');
    expect(images.map(i => i.filename)).toContain('photo.jpg');
    expect(images.map(i => i.filename)).toContain('diagram.gif');
  });

  it('should not detect duplicate image references', () => {
    const content = '![[image.png]] and ![[image.png]]';
    const images = findImageReferences(content);
    expect(images).toHaveLength(1);
    expect(images[0].filename).toBe('image.png');
  });

  it('should handle no image references', () => {
    const content = 'Text without images';
    const images = findImageReferences(content);
    expect(images).toEqual([]);
  });

  it('should return null for missing image', () => {
    const imageName = 'missing.png';
    const docPath = '/source/docs/my-document.md';
    const sourcePath = '/source';
    const imagePath = findImageFile(imageName, docPath, sourcePath);
    expect(imagePath).toBeNull();
  });

  it('should transform image paths in markdown with line breaks', () => {
    const content = 'Text with ![[image.png]] embedded';
    const slug = 'my-doc';
    const result = transformImagePaths(content, slug);
    expect(result).toContain('![image.png](/assets/my-doc/image.png)');
    expect(result).toContain('\n\n');
  });

  it('should transform image with width to figure wrapped img tag', () => {
    const content = '![[screenshot.png|500]]';
    const slug = 'my-doc';
    const result = transformImagePaths(content, slug);
    expect(result).toContain('<figure>');
    expect(result).toContain('<img src="/assets/my-doc/screenshot.png" alt="screenshot.png" width="500" />');
    expect(result).toContain('</figure>');
  });

  it('should handle multiple images with mixed width in markdown', () => {
    const content = '![[first.png]] and ![[second.jpg|300]]';
    const slug = 'my-doc';
    const result = transformImagePaths(content, slug);
    expect(result).toContain('![first.png](/assets/my-doc/first.png)');
    expect(result).toContain('<figure><img src="/assets/my-doc/second.jpg" alt="second.jpg" width="300" /></figure>');
  });

  it('should warn on missing images', () => {
    const content = '![[missing.png]]';
    const doc = createMockDoc({ slug: 'test-doc', filePath: '/source/test-doc.md' });
    const sourcePath = '/source';
    const { warnings } = processImages(content, doc, sourcePath);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('missing.png');
    expect(warnings[0]).toContain('Test Doc');
  });

  it('should process images and return transformed content with line breaks', () => {
    const content = '![[image.png]]';
    const doc = createMockDoc({ slug: 'test-doc', filePath: '/source/test-doc.md' });
    const sourcePath = '/source';
    const { content: result } = processImages(content, doc, sourcePath);
    expect(result).toContain('![image.png](/assets/test-doc/image.png)');
    expect(result).toContain('\n\n');
  });
});

describe('cleanupUnusedImages', () => {
  it('should return empty result when asset dir does not exist', () => {
    const result = cleanupUnusedImages('/nonexistent/posts', '/nonexistent/assets');
    expect(result.removedImages).toEqual([]);
    expect(result.removedDirs).toEqual([]);
  });
});
