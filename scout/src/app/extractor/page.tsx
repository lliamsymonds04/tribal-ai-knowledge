import KnowledgeExtractor from '@/components/KnowledgeExtractor';

export const metadata = {
  title: 'Knowledge Search - Scout',
  description: 'Search organizational knowledge captured from employee interviews using AI-powered RAG',
};

export default function ExtractorPage() {
  return <KnowledgeExtractor />;
}
