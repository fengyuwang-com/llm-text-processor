export function splitIntoSentences(text: string): string[] {
  const pattern = /(?<=[。！？!?…])\s*|(?<=[\n\r])\s*/g;
  return text.split(pattern).map(s => s.trim()).filter(Boolean);
}

export function splitIntoParagraphs(text: string): string[] {
  return text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
}

function splitLongSentence(sentence: string, maxChars: number): string[] {
  const subPattern = /(?<=[,，;；:：])\s*/;
  const clauses = sentence.split(subPattern).map(c => c.trim()).filter(Boolean);
  const result: string[] = [];
  let current = '';
  for (const clause of clauses) {
    if (current.length + clause.length > maxChars) {
      if (current) result.push(current);
      current = clause;
    } else {
      current += clause;
    }
  }
  if (current) result.push(current);
  return result;
}

export function chunkBySemanticBoundary(
  sentences: string[],
  maxChars: number = 2000,
  overlap: number = 1
): string[] {
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentLength = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const sentenceLen = sentence.length;

    if (sentenceLen > maxChars) {
      if (currentChunk.length) {
        chunks.push(currentChunk.join('\n'));
        currentChunk = [];
        currentLength = 0;
      }
      const subChunks = splitLongSentence(sentence, maxChars);
      chunks.push(...subChunks);
      continue;
    }

    if (currentLength + sentenceLen > maxChars && currentChunk.length) {
      chunks.push(currentChunk.join('\n'));
      if (overlap > 0 && currentChunk.length > overlap) {
        const overlapSentences = currentChunk.slice(-overlap);
        currentChunk = [...overlapSentences];
        currentLength = overlapSentences.reduce((sum, s) => sum + s.length, 0);
      } else {
        currentChunk = [];
        currentLength = 0;
      }
    }

    currentChunk.push(sentence);
    currentLength += sentenceLen;
  }

  if (currentChunk.length) {
    chunks.push(currentChunk.join('\n'));
  }

  return chunks;
}

export function chunkParagraphs(
  paragraphs: string[],
  maxChars: number = 2000,
  overlap: number = 1
): string[] {
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentLength = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i];
    const paraLen = para.length;

    if (paraLen > maxChars) {
      if (currentChunk.length) {
        chunks.push(currentChunk.join('\n\n'));
        currentChunk = [];
        currentLength = 0;
      }
      const sentences = splitIntoSentences(para);
      const subChunks = chunkBySemanticBoundary(sentences, maxChars, 0);
      chunks.push(...subChunks);
      continue;
    }

    if (currentLength + paraLen > maxChars && currentChunk.length) {
      chunks.push(currentChunk.join('\n\n'));
      if (overlap > 0 && currentChunk.length > overlap) {
        const overlapParas = currentChunk.slice(-overlap);
        currentChunk = [...overlapParas];
        currentLength = overlapParas.reduce((sum, p) => sum + p.length, 0);
      } else {
        currentChunk = [];
        currentLength = 0;
      }
    }

    currentChunk.push(para);
    currentLength += paraLen;
  }

  if (currentChunk.length) {
    chunks.push(currentChunk.join('\n\n'));
  }

  return chunks;
}

export interface ChunkOptions {
  mode: 'sentence' | 'paragraph';
  maxChars: number;
  overlap: number;
}

export function chunkText(text: string, options: ChunkOptions): string[] {
  const { mode, maxChars, overlap } = options;
  if (mode === 'sentence') {
    const sentences = splitIntoSentences(text);
    return chunkBySemanticBoundary(sentences, maxChars, overlap);
  }
  const paragraphs = splitIntoParagraphs(text);
  return chunkParagraphs(paragraphs, maxChars, overlap);
}
