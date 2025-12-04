// source.config.ts
import {
  defineConfig,
  defineDocs,
  frontmatterSchema
} from "fumadocs-mdx/config";
import rehypePrettyCode from "rehype-pretty-code";
import { z } from "zod";

// lib/highlight-code.ts
var transformers = [];

// lib/rehype-image-theme.ts
var rehypeImageTheme = () => {
  return (tree) => {
    return tree;
  };
};

// source.config.ts
var source_config_default = defineConfig({
  mdxOptions: {
    rehypePlugins: (plugins) => {
      plugins.shift();
      plugins.push([rehypeImageTheme]);
      plugins.push([
        // TODO: fix the type.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rehypePrettyCode,
        {
          theme: {
            dark: "vitesse-dark",
            light: "vitesse-light"
          },
          transformers,
          // 优化代码高亮性能
          keepBackground: false,
          // 减少内联样式
          defaultLang: "plaintext",
          // 默认语言
          grid: false
          // 禁用网格布局，减少处理时间
        }
      ]);
      return plugins;
    }
  },
  // 开发模式缓存优化
  devCaching: true,
  // 减少不必要的编译
  lastModifiedTime: "git"
});
var docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: frontmatterSchema.extend({
      links: z.object({
        doc: z.string().optional(),
        api: z.string().optional()
      }).optional()
    })
  }
});
var templates = defineDocs({
  dir: "content/templates",
  docs: {
    schema: frontmatterSchema.extend({
      tags: z.array(z.string()).optional(),
      role: z.enum(["TEMPLATE_1", "TEMPLATE_2"]).optional(),
      image: z.string().optional(),
      zipFile: z.string().optional(),
      actionButtons: z.array(z.string()).optional(),
      links: z.object({
        doc: z.string().optional(),
        api: z.string().optional()
      }).optional()
    })
  }
});
var zhTemplates = defineDocs({
  dir: "content/templates",
  docs: {
    schema: frontmatterSchema.extend({
      tags: z.array(z.string()).optional(),
      role: z.enum(["TEMPLATE_1", "TEMPLATE_2"]).optional(),
      image: z.string().optional(),
      zipFile: z.string().optional(),
      actionButtons: z.array(z.string()).optional(),
      links: z.object({
        doc: z.string().optional(),
        api: z.string().optional()
      }).optional()
    })
  }
});
var zhDocs = defineDocs({
  dir: "content/docs/zh",
  docs: {
    schema: frontmatterSchema.extend({
      links: z.object({
        doc: z.string().optional(),
        api: z.string().optional()
      }).optional()
    })
  }
});
var blog = defineDocs({
  dir: "content/blog",
  docs: {
    schema: frontmatterSchema.extend({
      category: z.string(),
      author: z.object({
        name: z.string(),
        avatar: z.string()
      }),
      image: z.string(),
      tags: z.array(z.string()).optional(),
      isFeatured: z.boolean().optional()
    })
  }
});
var zhBlog = defineDocs({
  dir: "content/blog/zh",
  docs: {
    schema: frontmatterSchema.extend({
      category: z.string(),
      author: z.object({
        name: z.string(),
        avatar: z.string()
      }),
      image: z.string(),
      tags: z.array(z.string()).optional(),
      isFeatured: z.boolean().optional()
    })
  }
});
export {
  blog,
  source_config_default as default,
  docs,
  templates,
  zhBlog,
  zhDocs,
  zhTemplates
};
