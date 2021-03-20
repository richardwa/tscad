import { ShaderSrc } from './gl-util';
declare global {
    interface Window {
        shaderSrc?: ShaderSrc;
    }
}
