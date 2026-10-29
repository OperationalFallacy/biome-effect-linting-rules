import { Context, Layer } from "effect";

{
  class ImplicitLayerService extends Context.Service<ImplicitLayerService, {}>()("Counter") {
    static readonly layer = Layer.effect(this, this.make);
  }
}

{
  class ImplicitMakeService extends Context.Service<ImplicitMakeService, {}>()("Counter") {
    static readonly layer = Layer.effect(ImplicitMakeService, this.make);
  }
}

{
  class ImplicitTagService extends Context.Service<ImplicitTagService, {}>()("Counter") {
    static readonly layer = Layer.effect(this, ImplicitTagService.make);
  }
}

{
  class ComposedImplicitService extends Context.Service<ComposedImplicitService, {}>()("Counter") {
    static readonly layer = Layer.effect(this, this.make).pipe(Layer.provide(Dependencies));
  }
}

{
  class ExplicitLayerService extends Context.Service<ExplicitLayerService, {}>()("Counter") {
    static readonly layer = Layer.effect(ExplicitLayerService, ExplicitLayerService.make).pipe(Layer.provide(Dependencies));
  }
}

{
  class InstanceMethodService extends Context.Service<InstanceMethodService, {}>()("Counter") {
    read() {
      return this.value;
    }
  }
}

{
  class LayerFactoryService extends Context.Service<LayerFactoryService, {}>()("Counter") {
    static createLayer = () => Layer.effect(this, this.make);
  }
}

{
  class Widget {
    static layer = Layer.effect(this, this.make);
  }
}
