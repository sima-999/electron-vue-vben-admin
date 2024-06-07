import type { MessageArgsProps } from 'ant-design-vue';

export default {
  message: (message: string, options: MessageArgsProps = { content: '' }) =>
    renderer.WindowManager.showMessage({
      message,
      options,
    }),
};
