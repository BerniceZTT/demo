import html2canvas from 'html2canvas';
import { Cartesian3, Cartographic, ScreenSpaceEventHandler, Viewer } from 'cesium';
import BoundingSphere from 'cesium/Source/Core/BoundingSphere';
import HeadingPitchRange from "cesium/Source/Core/HeadingPitchRange";
import Menu from '../contextmenu/menu';
import PostProcessStage from "cesium/Source/Scene/PostProcessStage";
import PostProcessStageCollection from "cesium/Source/Scene/PostProcessStageCollection";
import * as Cesium from 'cesium';

class CatCesium implements I_catCesium {

	private viewer: Viewer;
	private rightPosition: Array<number> = [];
  private pickedObj: Object = {};
	private rotateHeading: number = 0;
	private rotatePitch: number = 0;
	private rotateRange: number = 0;
	private rotateFun: () => void;
	private stages: PostProcessStageCollection;
	private curStage: PostProcessStage | null = null;
	private domID: string;

	constructor(viewer: Viewer, id: string) {
		this.viewer = viewer;
		this.domID = id;
		this.rotateFun = this.rotate.bind(this);
		this.stages = this.viewer.scene.postProcessStages;
		this.viewer.scene.postProcessStages.bloom.uniforms.contrast = 128;
		this.viewer.scene.postProcessStages.bloom.uniforms.brightness = -0.2;
		this.viewer.scene.postProcessStages.bloom.uniforms.delta = 1.0;
		this.viewer.scene.postProcessStages.bloom.uniforms.sigma = 3.0;
		this.viewer.scene.postProcessStages.bloom.uniforms.stepSize = 5.0;
	};

	public init(menu: Menu): void {
		const handler: ScreenSpaceEventHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
		handler.setInputAction((movement: any) => {
      console.log("movement", movement)
			let e: T_e = { clientX: movement.position.x, clientY: movement.position.y };
			menu.display(e);

			let pickedObj: Object = this.viewer.scene.pick(movement.position);
			if (this.viewer.scene.pickPositionSupported && Cesium.defined(pickedObj)) {
				const cartesian = this.viewer.scene.pickPosition(movement.position);
				if (Cesium.defined(cartesian)) {
					this.rightPosition = this.transformCnToCc(cartesian);
          this.pickedObj = pickedObj;
          console.log("1111", pickedObj)
				}
			} else {
				let earthPosition: Cartesian3 = this.viewer.camera.pickEllipsoid(movement.position, this.viewer.scene.globe.ellipsoid) as Cartesian3;
				if (Cesium.defined(earthPosition)) {
					this.rightPosition = this.transformCnToCc(earthPosition);
          console.log("2222", earthPosition)
				}
			}
		}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

    document.addEventListener("keydown", function (e) {
      switch (e.code) {
        case "ArrowDown"://下
          if (e.shiftKey) {
            // speed down
            console.log("40-1", e)
          } else {
            // pitch down
            console.log("40-2", e)
          }
          break;
        case "ArrowUp"://上
          if (e.shiftKey) {
            // speed up
            console.log("38-1", e)
          } else {
            // pitch up
            console.log("38-2", e)
          }
          break;
        case "ArrowRight"://又
          if (e.shiftKey) {
            // roll right
            console.log("39-1", e)
          } else {
            // turn right
            console.log("39-2", e)
          }
          break;
        case "ArrowLeft"://左
          if (e.shiftKey) {
            // roll left until
            console.log("37-1", e)
          } else {
            // turn left
            console.log("37-2", e)
          }
          break;
        default:
      }
    });
	};

	public getLocalPos(): void {
    console.log("")
		const tempInfo: string = `经度：${this.rightPosition[0]};\n纬度：${this.rightPosition[1]};\n高度：${this.rightPosition[2].toFixed(3)}米`;
		alert(tempInfo);
	};

	public getCameraInfo(): void {
		let cPosition: Array<number> = this.transformCnToCc(this.viewer.camera.position);
		let heading: number = this.viewer.camera.heading * 180 / Math.PI;
		let pitch: number = this.viewer.camera.pitch * 180 / Math.PI;
		let roll: number = this.viewer.camera.roll * 180 / Math.PI;
		const tempInfo: string = `视点位置：[${cPosition[0].toFixed(5)}，${cPosition[1].toFixed(5)}]  视点高度：${cPosition[2].toFixed(3)}\n航偏角：${heading.toFixed(2)}度，俯仰角：${pitch.toFixed(2)}度，翻滚角：${roll.toFixed(2)}度`;
		alert(tempInfo);
	};

	public moveToRightClick(): void {
		let heading: number = this.viewer.scene.camera.heading;
		let pitch: number = this.viewer.scene.camera.pitch;
		let range: number = Cesium.Cartesian3.distance(Cesium.Cartesian3.fromDegrees(...this.rightPosition), this.viewer.scene.camera.position) * 0.1;
		let offset: HeadingPitchRange = new Cesium.HeadingPitchRange(Cesium.Math.toRadians(heading), pitch, range);

		const BS: BoundingSphere = new Cesium.BoundingSphere(Cesium.Cartesian3.fromDegrees(...this.rightPosition), 0);
		this.viewer.camera.flyToBoundingSphere(BS, {
			duration: 0,
			offset: offset,
		});
	};

	public standRightClick(): void {
		let heading: number = this.viewer.scene.camera.heading;
		let pitch: number = -Cesium.Math.toRadians(5);
		let range: number = 5;
		let offset: HeadingPitchRange = new Cesium.HeadingPitchRange(Cesium.Math.toRadians(heading), pitch, range);

		const BS: BoundingSphere = new Cesium.BoundingSphere(Cesium.Cartesian3.fromDegrees(...this.rightPosition), 0);
		this.viewer.camera.flyToBoundingSphere(BS, {
			duration: 0,
			offset: offset,
		});
	};

	public printscreen(): void {
		let tempCanvas: HTMLElement = this.domID.length ? document.getElementById(this.domID) as HTMLElement : this.viewer.canvas;
		html2canvas(tempCanvas).then((canvas: HTMLCanvasElement): void => {
			let img: string = canvas.toDataURL('image/png');
			const link: HTMLAnchorElement = document.createElement('a');
			link.href = img;
			link.download = "Cesium截屏";
			link.style.display = 'none';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		});
	};

	public openSun(state: boolean): void {
		this.viewer.scene.globe.enableLighting = state;
		this.viewer.shadows = state;
	};

	public openSkyAtmosphere(state: boolean): void {
		this.viewer.scene.skyAtmosphere.show = state;
	};

	public openDepthTestAgainstTerrain(state: boolean): void {
		this.viewer.scene.globe.depthTestAgainstTerrain = state;
	};

	public openEarthOpt(state: boolean): void {
		if (state) {
			this.viewer.scene.globe.translucency.enabled = true;
			this.viewer.scene.globe.translucency.frontFaceAlpha = 0.2;
			this.viewer.scene.globe.translucency.backFaceAlpha = 0.2;
		} else {
			this.viewer.scene.globe.translucency.enabled = false;
		}
	};

	public openEarthTriangle(state: boolean): void {
		// @ts-ignore
		this.viewer.scene.globe._surface.tileProvider._debug.wireframe = state;
		this.viewer.scene.requestRender();
	};

	public arroundFly(): void {
		this.rotatePitch = this.viewer.scene.camera.pitch;
		this.rotateRange = Cesium.Cartesian3.distance(Cesium.Cartesian3.fromDegrees(...this.rightPosition), this.viewer.scene.camera.position);
		this.viewer.scene.screenSpaceCameraController.enableInputs = false;

		this.viewer.clock.onTick.addEventListener(this.rotateFun);
	};

	public stopArround(): void {
		this.viewer.clock.onTick.removeEventListener(this.rotateFun);
		this.viewer.scene.screenSpaceCameraController.enableInputs = true;
		this.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
	};

	private rotate(): void {
		this.rotateHeading += 0.1;
		const offset: HeadingPitchRange = new Cesium.HeadingPitchRange(Cesium.Math.toRadians(this.rotateHeading), this.rotatePitch, this.rotateRange);
		this.viewer.camera.lookAt(Cesium.Cartesian3.fromDegrees(...this.rightPosition), offset);
	};

	public transformCnToCc(cartesianPosition: Cartesian3): Array<number> {
		const cartographic: Cartographic = Cesium.Cartographic.fromCartesian(cartesianPosition);
		const lng: number = Cesium.Math.toDegrees(cartographic.longitude);
		const lat: number = Cesium.Math.toDegrees(cartographic.latitude);
		const height: number = cartographic.height;

		return [lng, lat, height];
	};

	public openNightVision(state: boolean): void {
		if (state) {
			if (this.curStage) {
				this.stages.remove(this.curStage);
			}
			this.curStage = this.stages.add(Cesium.PostProcessStageLibrary.createNightVisionStage()) as PostProcessStage;
		} else {
			this.stages.remove(this.curStage as PostProcessStage);
		}
	};

	public openBlackAndWhite(state: boolean): void {
		if (state) {
			if (this.curStage) {
				this.stages.remove(this.curStage);
			}
			this.curStage = this.stages.add(Cesium.PostProcessStageLibrary.createBlackAndWhiteStage()) as PostProcessStage;
		} else {
			this.stages.remove(this.curStage as PostProcessStage);
		}
	};

	public openMosaic(state: boolean): void {
		if (state) {
			if (this.curStage) {
				this.stages.remove(this.curStage);
			}

			const fragmentShaderSource: string =
				"uniform sampler2D colorTexture; \n" +
				"varying vec2 v_textureCoordinates; \n" +
				"const int KERNEL_WIDTH = 16; \n" +
				"void main(void) \n" +
				"{ \n" +
				"    vec2 step = czm_pixelRatio / czm_viewport.zw; \n" +
				"    vec2 integralPos = v_textureCoordinates - mod(v_textureCoordinates, 8.0 * step); \n" +
				"    vec3 averageValue = vec3(0.0); \n" +
				"    for (int i = 0; i < KERNEL_WIDTH; i++) \n" +
				"    { \n" +
				"        for (int j = 0; j < KERNEL_WIDTH; j++) \n" +
				"        { \n" +
				"            averageValue += texture2D(colorTexture, integralPos + step * vec2(i, j)).rgb; \n" +
				"        } \n" +
				"    } \n" +
				"    averageValue /= float(KERNEL_WIDTH * KERNEL_WIDTH); \n" +
				"    gl_FragColor = vec4(averageValue, 1.0); \n" +
				"} \n";

			this.curStage = this.stages.add(new Cesium.PostProcessStage({ fragmentShader: fragmentShaderSource, })) as PostProcessStage;
		} else {
			this.stages.remove(this.curStage as PostProcessStage);
		}
	};

	public openDepthOfField(state: boolean): void {
		if (state) {
			if (this.curStage) {
				this.stages.remove(this.curStage);
			}
			this.curStage = this.stages.add(Cesium.PostProcessStageLibrary.createDepthOfFieldStage()) as PostProcessStage;
		} else {
			this.stages.remove(this.curStage as PostProcessStage);
		}
	};

	public openBloom(state: boolean): void {
		if (this.curStage) {
			this.stages.remove(this.curStage);
		}
		this.viewer.scene.postProcessStages.bloom.enabled = state;
	};

  public placeModel(id: string): void {
    const viewer = window.viewer as Cesium.Viewer;
    // 获取 pick 拾取对象
    var pick = viewer.scene.pick(event.position);
    // 判断是否获取到了 pick
    if (Cesium.defined(pick)) {
      // 修改拾取到的entity的样式
      pick.id.billboard.image = "xxx.png"
    }
    // const long = this.rightPosition[0];
    // const lat = this.rightPosition[1];
    // const height = this.rightPosition[2].toFixed(3);
    // var position = Cesium.Cartesian3.fromDegrees(long, lat, Number(height),)
    // const viewer = window.viewer as Cesium.Viewer;
    // viewer.entities.add(
    //   new Cesium.Entity({
    //   id: 'model_1',
    //   position: position,
    //   model: {
    //     uri: "/sampleData/model/办公楼.glb",
    //     scale: 10,
    //   },
    //   }),
    // );
    // viewer.flyTo(window.viewer.entities);
   };

   public removeModel(id: string): void {
    const tempInfo: string = `经度：${this.rightPosition[0]};\n纬度：${this.rightPosition[1]};\n高度：${this.rightPosition[2].toFixed(3)}米`;
    alert(tempInfo);
   };

   public removeAllModels(): void {
    const tempInfo: string = `经度：${this.rightPosition[0]};\n纬度：${this.rightPosition[1]};\n高度：${this.rightPosition[2].toFixed(3)}米`;
    alert(tempInfo);
   };
}


export default CatCesium;
