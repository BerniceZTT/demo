import * as Cesium from 'cesium';
import { v1 as uuidv1 } from 'uuid';
import type {
  ModelGraphics,
  PathRoamimg,
  PolygonGraphics,
} from './graphic';

export interface DynamicEntity extends Cesium.Entity.ConstructorOptions {
  position: any;
  modelPosition?: { lng: number; lat: number; alt: number };
  folatPosition?: { lng: number; lat: number; alt: number };
  model?: Cesium.ModelGraphics.ConstructorOptions;
  label?: Cesium.LabelGraphics.ConstructorOptions;
  billboard?: Cesium.BillboardGraphics.ConstructorOptions;
  distanceDisplayConditionMin?: number;
  distanceDisplayConditionMax?: number;
}

export class Graphic {
  private viewer: Cesium.Viewer;
  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
  }

  /**
   * 创建一个实体图形
   */
  createGraphics(id?: string) {
    return new Cesium.Entity({
      id: id || uuidv1(),
    });
  }
  //创建模型
  createModelGraphics(options: ModelGraphics) {
    if (options && options.position) {
      var entity = this.createGraphics();
      entity.model = this.getModelGraphics(options);
      entity.position = options.position;
      return entity;
    }
  }

  /**
   * 获取标签
   * @param {*} options
   */
  getLabelGraphics(options: Cesium.LabelGraphics.ConstructorOptions) {
    options = options || {};
    if (options && options.text) {
      return new Cesium.LabelGraphics({
        //文字标签
        text: options.text,
        font: options.font || '14px sans-serif',
        fillColor: options.fillColor || Cesium.Color.GOLD,
        style: options.style || Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: options.outlineWidth || 2,
        outlineColor: options.outlineColor || undefined,
        showBackground: options.showBackground || false,
        backgroundColor:
          options.backgroundColor || new Cesium.Color(0.165, 0.165, 0.165, 0.8),
        verticalOrigin: options.verticalOrigin || Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: options.pixelOffset || new Cesium.Cartesian2(0, -30),
        ...options,
        //heightReference:Cesium.HeightReference.RELATIVE_TO_GROUND
      });
    }
  }

  /**
   * 获取广告牌
   * @param {*} options
   */
  getBillboardGraphics(options: Cesium.BillboardGraphics.ConstructorOptions) {
    options = options || {};
    if (options && options.image) {
      return new Cesium.BillboardGraphics({
        image: options.image,
        width: options.width || 35,
        height: options.height || 35,
        scale: options.scale || 1,
        // eyeOffset :new Cesium.Cartesian2(0, -20),
        pixelOffset: options.pixelOffset || new Cesium.Cartesian2(0, -20),
        scaleByDistance: options.scaleByDistance || undefined,
        heightReference:
          options.heightReference || Cesium.HeightReference.RELATIVE_TO_GROUND,
        ...options,
      });
    }
  }
  //线
  getLineGraphics(options: Cesium.PolylineGraphics.ConstructorOptions) {
    options = options || {};
    if (options && options.positions) {
      return new Cesium.PolylineGraphics({
        show: true,
        positions: options.positions,
        material: options.material || Cesium.Color.YELLOW,
        width: options.width || 1,
        clampToGround: options.clampToGround || false,
      });
    }
  }
  // 面
  getPolygonGraphics(options: PolygonGraphics) {
    options = options || {};
    if (options && options.positions) {
      return new Cesium.PolygonGraphics({
        hierarchy: { positions: options.positions },
        material: options.material || Cesium.Color.RED.withAlpha(0.2),
        clampToGround:
          options.heightReference || Cesium.HeightReference.CLAMP_TO_GROUND,
      });
    }
  }

  /**
   * 获取模型
   * @param {*} options
   */
  getModelGraphics(options: Cesium.ModelGraphics.ConstructorOptions) {
    options = options || {};
    if (options) {
      return new Cesium.ModelGraphics({
        uri: options.uri,
        scale: options.scale || 28,
        minimumPixelSize: options.minimumPixelSize || 30,
        color: options.color || Cesium.Color.WHITE,
        ...options,
      });
    }
    return null;
  }

  getDynamicEntity(opt: DynamicEntity) {
    const Entity = this.createGraphics(opt.id);
    if (Entity && opt.model && JSON.stringify(opt.model) !== '{}') {
      Entity.model = this.getModelGraphics({
        uri: '/data/model/zhui.glb',
        scale: 40,
        minimumPixelSize: 50,
        heightReference: Cesium.HeightReference.NONE,
        ...opt.model,
      });

      if (opt.modelPosition) {
        this.setGraphicsRotate({
          entity: Entity,
          position: opt.modelPosition,
          rotateAmount: 4,
        });
      }
    }

    if (opt.billboard) {
      Entity.billboard = this.getBillboardGraphics({
        image: 'examples/images/Textures/warn.png',
        width: 55,
        height: 55,
        pixelOffset: new Cesium.Cartesian2(0, -60),

        ...opt.billboard,
      });
    }

    if (opt.label && JSON.stringify(opt.label) !== '{}') {
      Entity.label = this.getLabelGraphics({
        font: '16px sans-serif',
        pixelOffset: new Cesium.Cartesian2(0, -100),
        fillColor: Cesium.Color.CYAN,
        ...opt.label,
      });
    }
    Entity.position = opt.position;
    Entity.description = opt?.description;
    Entity.name = opt.name;

    return Entity;
  }

  /**
   * 线圈发光扩散效果
   * @returns
   */
  Scanline() {
    return new Scanline(this.viewer);
  }

  /**
   * 道路穿梭线
   * @param url  geojson url
   * @param Picurl  图片
   * @param width  宽度
   * @param time  时间
   */
  addRoadLine(url: string, Picurl: string, width: number, time: number) {
    const _this = this;
    let promise = Cesium.GeoJsonDataSource.load(url);
    promise.then(function (dataSource: any) {
      _this.viewer.dataSources.add(dataSource);
      const RoadPicEntities = dataSource.entities.values;
      for (let i = 0; i < RoadPicEntities.length; i++) {
        const entity = RoadPicEntities[i];
        entity.polyline.width = width;
        entity.polyline.material = new Cesium.Spriteline1MaterialProperty(
          time,
          Picurl,
        );
      }
    });
  }

  /**
   * 路径漫游 支持第一时间，匀速和自定义时间
   * @param {*} options
   */
  buildPathRoaming(options: PathRoamimg) {
    if (this.viewer && options && options.paths) {
      var _paths = options.paths,
        _positionProperty = new Cesium.SampledPositionProperty(),
        _rEntity = this.createGraphics(),
        _directionProperty = new Cesium.SampledPositionProperty(),
        _startTime = new Cesium.JulianDate(),
        _direction = null,
        _stopTime = null,
        _increment = null,
        _time = null;

      console.log('entity', _rEntity);

      if (options.times) {
        // 漫游时间
        let _times = options.times - (options.times % (_paths.length - 1));

        _stopTime = Cesium.JulianDate.addSeconds(
          _startTime,
          _times,
          new Cesium.JulianDate(),
        );
        _increment = _times / (_paths.length - 1);
      } else {
        // 自定义
        _stopTime = Cesium.JulianDate.addSeconds(
          _startTime,
          (_paths.length - 1) * (options.step || 120),
          new Cesium.JulianDate(),
        );
      }
      var startTime = options.startTime || _startTime;
      var stopTime = options.stopTime || _stopTime;
      this.viewer.clock.startTime = startTime.clone(); // 设置始时钟始时间
      this.viewer.clock.currentTime = startTime.clone(); // 设置时钟当前时间
      this.viewer.clock.stopTime = stopTime.clone(); // 设置始终停止时间
      this.viewer.clock.multiplier = options.multiplier || 10; // 时间速率，数字越大时间过的越快

      // this.viewer.timeline.zoomTo(startTime, stopTime);

      this.viewer.clock.clockRange =
        options.clockRange || Cesium.ClockRange.LOOP_STOP; // 循环执行
      for (var i = 0; i < _paths.length; i++) {
        var cartesian = Cesium.Cartesian3.fromDegrees(
          _paths[i].lon,
          _paths[i].lat,
          _paths[i].alt,
        );

        if (options.times) {
          // 漫游时间
          _time = Cesium.JulianDate.addSeconds(
            startTime,
            i * _increment,
            new Cesium.JulianDate(),
          );
        } else {
          // 自定义
          _time = Cesium.JulianDate.addSeconds(
            startTime,
            _paths[i].time,
            new Cesium.JulianDate(),
          );
        }
        _positionProperty.addSample(_time, cartesian); // 添加位置，和时间对应

        // --------------
        let directionCartesian = null;
        // let hpr = this.getObjectQuaternion(this.getObjectMatrix4(cartesian))  // 添加四元数插值
        if (i === _paths.length - 1) {
          _directionProperty.addSample(_time, _direction);
          continue;
        } else {
          directionCartesian = Cesium.Cartesian3.fromDegrees(
            _paths[i + 1].lon,
            _paths[i + 1].lat,
            _paths[i + 1].alt,
          );
        }
        _direction = this.getDirection(directionCartesian, cartesian);

        _directionProperty.addSample(_time, _direction);
      }
      _rEntity.name = options.name || '路径漫游';
      _rEntity.availability = new Cesium.TimeIntervalCollection([
        new Cesium.TimeInterval({ start: startTime, stop: stopTime }),
      ]); // 和时间轴关联

      _rEntity.position = _positionProperty;

      _rEntity.orientation = new Cesium.VelocityOrientationProperty(
        _positionProperty,
      ); // 基于位置移动自动计算方向

      _rEntity.direction = _directionProperty;
      // 添加图形
      let polyline = [] as any[];
      if (options?.polyline) {
        _rEntity.polyline = {
          positions: new Cesium.CallbackProperty(function () {
            return polyline;
          }, false),
          width: 10,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 1,
            color: Cesium.Color.RED,
          }),
          clampToGround: true,
        };
      }

      if (options!!.model) {
        _rEntity.model = this.getModelGraphics(options.model);
      }

      if (options?.label) {
        _rEntity.label = this.getLabelGraphics(options.label);
      }
      if (options?.billboard) {
        _rEntity.billboard = this.getBillboardGraphics(options.billboard);
      }
      if (options?.path) {
        _rEntity.path = options?.path;
      }

      // 视角跟踪
      if (options?.firstView) {
        this.viewer.scene.postUpdate.addEventListener(() => {
          let position = _rEntity.position.getValue(
            this.viewer.clock.currentTime,
          );
          let direction = _rEntity.direction.getValue(
            this.viewer.clock.currentTime,
          );
          this.viewer.scene.camera.setView({
            destination: position, // 点的坐标
            orientation: {
              direction: direction,
              up: new Cesium.Cartesian3(0, 0, 0),
            },
          });
          this.viewer.scene.camera.lookUp(options?.up || 200);
          this.viewer.scene.camera.lookDown(options?.down || 150);
          this.viewer.scene.camera.moveBackward(options?.backward || 1200);
        });
      }

      return _rEntity;
    }
  }

  /**
   * 获取两个点的方向
   * @param {Object} position 起点
   * @param {Object} tagPosition 目标点
   *
   * @return {Cartesian3} Direction 三维方向
   */
  getDirection(tagPosition: any, position: any) {
    return Cesium.Cartesian3.normalize(
      Cesium.Cartesian3.subtract(
        tagPosition,
        position,
        new Cesium.Cartesian3(),
      ),
      new Cesium.Cartesian3(),
    );
  }
}
