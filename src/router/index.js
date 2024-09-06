import { createRouter, createWebHistory } from 'vue-router';
import Home from '../components/Home.vue';
import ObjectDiagramGenerator from '../components/ObjectDiagramGenerator.vue';
import SequenceDiagramGenerator from '../components/SequenceDiagramGenerator.vue'; // 序列图生成组件 (待开发)
import TextTranslator from '../components/TextTranslator.vue'; // 文本翻译组件 (待开发)
import WordTranslator from '../components/WordTranslator.vue'; // Word 文档翻译组件 (使用 iframe 嵌入)
import DddBlog from '../components/DddBlog.vue'; // Word 文档翻译组件 (使用 iframe 嵌入)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
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

// 设置页面标题的导航守卫
router.beforeEach((to, from, next) => {
  // 根据路由名称设置页面标题
  if (to.name === 'object-diagram-generator') {
    document.title = 'Domain Model Object Diagram Generator - ModelWise';
  } else if (to.name === 'sequence-diagram-generator') {
    document.title = 'Domain Model Sequence Diagram Generator - ModelWise';
  } else if (to.name === 'text-translator') {
    document.title = 'AI powered text translate - ModelWise';
  } else if (to.name === 'word-translator') {
    document.title = 'AI powered word document translate - ModelWise';
  } else if (to.name === 'ddd-blog') {
    document.title = 'Domain Driven Design Blogs - ModelWise';
  } 
  next();
});

export default router;