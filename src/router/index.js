import { createRouter, createWebHistory } from 'vue-router';
import ObjectDiagramGenerator from '../components/ObjectDiagramGenerator.vue';
import SequenceDiagramGenerator from '../components/SequenceDiagramGenerator.vue'; // 序列图生成组件 (待开发)
import TextTranslator from '../components/TextTranslator.vue'; // 文本翻译组件 (待开发)
import WordTranslator from '../components/WordTranslator.vue'; // Word 文档翻译组件 (使用 iframe 嵌入)
import DddBlog from '../components/DddBlog.vue'; // Word 文档翻译组件 (使用 iframe 嵌入)

const routes = [
  {
    path: '/',
    name: 'object-diagram-generator',
    component: ObjectDiagramGenerator,
  },
  {
    path: '/object-diagram-generator',
    name: 'object-diagram-generator',
    component: ObjectDiagramGenerator,
  },
  {
    path: '/sequence-diagram-generator',
    name: 'sequence-diagram-generator',
    component: SequenceDiagramGenerator,
  },
  {
    path: '/text-translator',
    name: 'text-translator',
    component: TextTranslator,
  },
  {
    path: '/word-translator',
    name: 'word-translator',
    component: WordTranslator,
  },
  {
    path: '/ddd-blog',
    name: 'ddd-blog',
    component: DddBlog,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;