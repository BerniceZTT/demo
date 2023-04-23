import * as Cesium from 'cesium';
interface PointGraphics {
  style?: Cesium.BillboardGraphics.ConstructorOptions;
  callback?: (position: any | undefined | null, graphic: Cesium.Entity) => void;
}

interface LineGraphics {
  style?: Cesium.PolygonGraphics.ConstructorOptions;
  callback?: (
    position: any[] | undefined | null,
    graphic: Cesium.Entity,
  ) => void;
  measure?: boolean;
  type?: 'straightLine' | string;
}

interface PolygonGraphics {
  style?: Cesium.PolylineGraphics.ConstructorOptions;
  callback?: (
    position: any[] | undefined | null,
    graphic: Cesium.Entity,
  ) => void;
  height?: number;
  measure?: boolean;
}

interface RectangleGraphics {
  style?: Cesium.RectangleGraphics.ConstructorOptions;
  callback?: (position: any[] | undefined, graphic: Cesium.Entity) => void;
  height?: number;
}

class Draw {
  viewer: Cesium.Viewer;
  _drawLayer: Cesium.CustomDataSource;
  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    this._drawLayer = new Cesium.CustomDataSource('drawLayer');
    viewer && viewer.dataSources.add(this._drawLayer);
  }

  drawPointGraphics(options?: PointGraphics) {
    const self = this;
    options = options || {};
    const style = {
      image: require("@/assets/img/location.png"),
      width: 35,
      height: 40,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      scale: 1,
      pixelOffset: new Cesium.Cartesian2(0, -20),
      ...options.style,
    };
    if (this.viewer) {
      const _poiEntity = new Cesium.Entity();

      let position = {} as Cesium.Cartesian3;
      let positions = [] as Array<Cesium.Cartesian3>;
      let poiObj: any = {};
      let _handlers = new Cesium.ScreenSpaceEventHandler(
        self.viewer.scene.canvas,
      );
      // left
      _handlers.setInputAction(function (movement) {
        const cartesian = self.viewer.scene.camera.pickEllipsoid(
          movement.position,
          self.viewer.scene.globe.ellipsoid,
        );
        if (cartesian && cartesian.x) {
          position = cartesian;
          _poiEntity.billboard = style as Cesium.BillboardGraphics;
          _poiEntity.position = position;
          poiObj = self._drawLayer.entities.add(_poiEntity);
          if (typeof options?.callback === 'function') {
            options?.callback(
              self.utils().transformCartesianToWGS84(position),
              poiObj,
            );
          }
          _handlers.destroy();
          _handlers = undefined as any;
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
  }

  /**
   * 画线 or 测距
   * @param {*} options
   */
  drawLineGraphics(options?: LineGraphics) {
    const self = this;
    options = options || {};
    if (self.viewer) {
      const positions: Array<Cesium.Cartesian3> = [];

      let _lineEntity = new Cesium.Entity();
      let lineObj: any;
      let _handlers = new Cesium.ScreenSpaceEventHandler(
        this.viewer.scene.canvas,
      );
      // left
      _handlers.setInputAction(function (movement) {
        var cartesian = self.getCatesian3FromPX(movement.position);
        if (cartesian && cartesian.x) {
          if (positions.length == 0) {
            positions.push(cartesian.clone());
          }
          if (options?.measure) {
            _addInfoPoint(cartesian);
          }
          // 绘制直线 两个点
          if (positions.length == 2 && options?.type === 'straightLine') {
            _handlers.destroy();
            _handlers = undefined as any;
            if (typeof options.callback === 'function') {
              options?.callback(
                self.transformCartesianArrayToWGS84Array(positions),
                lineObj,
              );
            }
          }
          positions.push(cartesian);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      _handlers.setInputAction(function (movement) {
        const cartesian = self.getCatesian3FromPX(movement.endPosition);
        if (positions.length >= 2) {
          if (cartesian && cartesian.x) {
            positions.pop();
            positions.push(cartesian);
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      // right
      _handlers.setInputAction(function (movement) {
        _handlers.destroy();
        _handlers = undefined as any;

        const cartesian = self.getCatesian3FromPX(movement.position);
        if (options?.measure) {
          _addInfoPoint(cartesian);
        }
        if (typeof options?.callback === 'function') {
          options?.callback(
            self.transformCartesianArrayToWGS84Array(positions),
            lineObj,
          );
        }
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

      const style = {
        width: 5,
        material: Cesium.Color.BLUE.withAlpha(0.8),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
      } as Cesium.PolygonGraphics.ConstructorOptions;

      const polylineGraphic = new Cesium.PolylineGraphics({
        positions: new Cesium.CallbackProperty(function () {
          return positions;
        }, false),
        ...style,
      });

      _lineEntity.polyline = polylineGraphic;

      lineObj = self._drawLayer.entities.add(_lineEntity);

      //添加坐标点
      function _addInfoPoint(position: any) {
        let _labelEntity = new Cesium.Entity();
        const pointGraphic = new Cesium.PointGraphics({
          pixelSize: 10,
          outlineColor: Cesium.Color.BLUE,
          outlineWidth: 5,
        });
        const labelGraphic = new Cesium.LabelGraphics({
          text:
            (
              Number(
                self
                  .getPositionDistance(
                    self.transformCartesianArrayToWGS84Array(positions),
                  ),
              ) / 1000
            ).toFixed(4) + '公里',
          show: true,
          showBackground: true,
          font: '14px monospace',
          horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(-20, -80), //left top
        });
        _labelEntity.position = position;
        _labelEntity.point = pointGraphic;
        _labelEntity.label = labelGraphic;
        self._drawLayer.entities.add(_labelEntity);
      }
    }
  }

  /**
   * 画面 or 测面积
   * @param {*} options
   */
  drawPolygonGraphics(options?: PolygonGraphics) {
    options = options || {};
    if (this.viewer) {
      let positions = [] as Array<Cesium.Cartesian3>,
        polygon = new Cesium.PolygonHierarchy(),
        _polygonEntity = new Cesium.Entity(),
        polygonGraphic = new Cesium.PolygonGraphics(),
        polylineGraphic = new Cesium.PolylineGraphics(),
        self = this,
        polyObj: any = null,
        _label = '',
        _handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
      // left
      _handler.setInputAction(function (movement) {
        var cartesian = self.getCatesian3FromPX(movement.position);
        if (cartesian && cartesian.x) {
          if (positions.length == 0) {
            polygon.positions.push(cartesian.clone());
            positions.push(cartesian.clone());
          }
          positions.push(cartesian.clone());
          polygon.positions.push(cartesian.clone());

          if (!polyObj) create();
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      // mouse
      _handler.setInputAction(function (movement) {
        var cartesian = self.getCatesian3FromPX(movement.endPosition);
        if (positions.length >= 2) {
          if (cartesian && cartesian.x) {
            positions.pop();
            positions.push(cartesian);
            polygon.positions.pop();
            polygon.positions.push(cartesian);
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      // right
      _handler.setInputAction(function (movement) {
        _handler.destroy();
        positions.push(positions[0]);

        if (options?.height) {
          //立体
          _polygonEntity.polygon.extrudedHeight = options?.height;
          _polygonEntity.polygon.material = Cesium.Color.BLUE.withAlpha(0.5);
        }
        if (options?.measure) {
          // 量测
          _addInfoPoint(positions[0]);
        }
        if (typeof options?.callback === 'function') {
          options.callback(
            self.transformCartesianArrayToWGS84Array(positions),
            polyObj,
          );
        }
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

      function create() {
        polylineGraphic = {
          width: 3,
          material: Cesium.Color.BLUE.withAlpha(0.8),
          clampToGround: true,
          positions: new Cesium.CallbackProperty(function () {
            return positions;
          }, false),
          ...options?.style,
        } as Cesium.PolylineGraphics;

        polygonGraphic = {
          hierarchy: new Cesium.CallbackProperty(function () {
            return polygon;
          }, false),
          material: Cesium.Color.WHITE.withAlpha(0.1),
          classificationType: Cesium.ClassificationType.BOTH,
          // clampToGround: options.clampToGround || false,
        } as Cesium.PolygonGraphics.ConstructorOptions;
        _polygonEntity.polygon = polygonGraphic;
        _polygonEntity.polyline = polylineGraphic;

        //_polygonEntity.clampToS3M = true;

        polyObj = self._drawLayer.entities.add(_polygonEntity);
      }

      function _addInfoPoint(position: Cesium.Cartesian3 | any) {
        const labelGraphics = new Cesium.LabelGraphics({
          text:
            (
              self
                .getPositionsArea(
                  self.transformCartesianArrayToWGS84Array(positions),
                ) / 1000000.0
            ).toFixed(4) + '平方公里',
          show: true,
          showBackground: true,
          font: '14px monospace',
          horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(-20, -50), //left top
        });

        const pointGraphics = new Cesium.PointGraphics({
          pixelSize: 10,
          outlineColor: Cesium.Color.BLUE,
          outlineWidth: 5,
        });
        const _labelEntity = new Cesium.Entity();
        _labelEntity.position = position;
        _labelEntity.point = pointGraphics;
        _labelEntity.label = labelGraphics;
        self._drawLayer.entities.add(_labelEntity);
      }
    }
  }

  /**
   * 画矩形
   * @param {*} options
   */
  drawRectangleGraphics(options?: RectangleGraphics) {
    if (this.viewer) {
      let _positions = [] as Cesium.Cartesian3[],
        _rectangleEntity = new Cesium.Entity(),
        _coordinates = new Cesium.Rectangle(),
        rectangGraphic = new Cesium.RectangleGraphics({
          outlineWidth: 3,
          material: Cesium.Color.BLUE.withAlpha(0.5),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          ...options?.style,
        }),
        self = this,
        rectangleObj: Cesium.Entity,
        _handler = new Cesium.ScreenSpaceEventHandler(self.viewer.scene.canvas);
      // left
      _handler.setInputAction(function (movement) {
        var cartesian = self.getCatesian3FromPX(movement.position);
        if (cartesian && cartesian.x) {
          if (_positions.length == 0) {
            _positions.push(cartesian.clone());
          } else {
            _handler.destroy();

            _positions.push(cartesian.clone());

            _coordinates = Cesium.Rectangle.fromCartesianArray(
              [..._positions, cartesian],
              Cesium.Ellipsoid.WGS84,
            );

            if (typeof options?.callback === 'function') {
              options?.callback(
                self.transformCartesianArrayToWGS84Array(_positions),
                rectangleObj,
              );
            }
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      // mouse
      _handler.setInputAction(function (movement) {
        var cartesian = self.getCatesian3FromPX(movement.endPosition);

        if (cartesian) {
          _coordinates = Cesium.Rectangle.fromCartesianArray(
            [..._positions, cartesian],
            Cesium.Ellipsoid.WGS84,
          );
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      _rectangleEntity.rectangle = rectangGraphic;

      if (options?.height)
        _rectangleEntity.rectangle.extrudedHeight = options?.height;
      _rectangleEntity.rectangle.coordinates = new Cesium.CallbackProperty(
        function () {
          return _coordinates;
        },
        false,
      );
      rectangleObj = this._drawLayer.entities.add(_rectangleEntity);
    }
  }

  /***
   * 坐标数组转换 笛卡尔转86
   *
   * @param {Array} cartesianArr 三维位置坐标数组
   *
   * @return {Array} {lng,lat,alt} 地理坐标数组
   */
  private transformCartesianArrayToWGS84Array(
    cartesianArr: Cesium.Cartesian3[],
  ) {
    if (this.viewer) {
      return cartesianArr
        ? cartesianArr.map((item) => {
          return this.transformCartesianToWGS84(item);
        })
        : [];
    }
  }

  /***
   * 坐标转换 笛卡尔转84
   *
   * @param {Object} Cartesian3 三维位置坐标
   *
   * @return {Object} {lng,lat,alt} 地理坐标
   */
  private transformCartesianToWGS84(cartesian: Cesium.Cartesian3) {
    if (this.viewer && cartesian) {
      const ellipsoid = Cesium.Ellipsoid.WGS84;
      const cartographic = ellipsoid.cartesianToCartographic(cartesian);
      return {
        lng: Cesium.Math.toDegrees(cartographic.longitude),
        lat: Cesium.Math.toDegrees(cartographic.latitude),
        alt: cartographic.height,
      };
    }
  }

  // 拾取位置点
  private getCatesian3FromPX(px: Cesium.Cartesian3) {
    if (this.viewer && px) {
      const picks = this.viewer.scene.pick(px);
      let cartesian = null;
      let isOn3dtiles = false,
        isOnTerrain = false;
      if (picks instanceof Cesium.Cesium3DTileFeature) {
        //模型上拾取
        isOn3dtiles = true;
      }
      // 3dtilset
      if (isOn3dtiles) {
        cartesian = this.viewer.scene.pickPosition(px);
        if (cartesian) {
          let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
          if (cartographic.height < 0) cartographic.height = 0;
          let lon = Cesium.Math.toDegrees(cartographic.longitude),
            lat = Cesium.Math.toDegrees(cartographic.latitude),
            height = cartographic.height; //模型高度
          cartesian = this.transformWGS84ToCartesian({ lng: lon, lat: lat, alt: height });
        }
      }
      // 地形
      if (
        !picks &&
        (!this.viewer.terrainProvider as any) instanceof Cesium.EllipsoidTerrainProvider
      ) {
        var ray = this.viewer.scene.camera.getPickRay(px);
        if (!ray) return null;
        cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
        isOnTerrain = true;
      }
      // 地球
      if (!isOn3dtiles && !isOnTerrain) {
        cartesian = this.viewer.scene.camera.pickEllipsoid(px, this.viewer.scene.globe.ellipsoid);
      }
      if (cartesian) {
        let position: any = this.transformCartesianToWGS84(cartesian);
        if (position.alt < 0) {
          cartesian = this.transformWGS84ToCartesian(position, 0.1);
        }
        return cartesian;
      }
      return false;
    }
  }

  /***
   * 坐标转换 84转笛卡尔
   *
   * @param {Object} {lng,lat,alt} 地理坐标
   *
   * @return {Object} Cartesian3 三维位置坐标
   */
  private transformWGS84ToCartesian(position: any, alt?: number) {
    if (this.viewer) {
      return position
        ? Cesium.Cartesian3.fromDegrees(
          position.lng || position.lon,
          position.lat,
          (position.alt = alt || position.alt),
          Cesium.Ellipsoid.WGS84,
        )
        : Cesium.Cartesian3.ZERO;
    }
  }

  /**
   * 计算一组坐标组成的面的面积
   * @param {*} positions
   */
  private getPositionsArea(positions: any[]) {
    let result = 0;
    if (positions) {
      let h = 0;
      let ellipsoid = Cesium.Ellipsoid.WGS84;
      positions.push(positions[0]);
      for (let i = 1; i < positions.length; i++) {
        let oel = ellipsoid.cartographicToCartesian(
          this.transformWGS84ToCartographic(positions[i - 1]),
        );
        let el = ellipsoid.cartographicToCartesian(
          this.transformWGS84ToCartographic(positions[i]),
        );
        h += oel.x * el.y - el.x * oel.y;
      }
      result = Number(Math.abs(h).toFixed(2));
    }
    return result;
  }

  /**
 * 获取84坐标的距离
 * @param {*} positions
 */
  private getPositionDistance(positions: any[]) {
    let distance = 0;
    for (let i = 0; i < positions.length - 1; i++) {
      let point1cartographic = this.transformWGS84ToCartographic(positions[i]);
      let point2cartographic = this.transformWGS84ToCartographic(positions[i + 1]);
      let geodesic = new Cesium.EllipsoidGeodesic();
      geodesic.setEndPoints(point1cartographic, point2cartographic);
      let s = geodesic.surfaceDistance;
      s = Math.sqrt(
        Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2),
      );
      distance = distance + s;
    }
    return distance.toFixed(3);
  }

  /**
  *
  * @param {*} position
  * 84坐标转制图坐标
  */
  private transformWGS84ToCartographic(position: any) {
    return position
      ? Cesium.Cartographic.fromDegrees(position.lng || position.lon, position.lat, position.alt)
      : Cesium.Cartographic.ZERO;
  }


  clear() {
    const layer = this.viewer.dataSources.getByName("drawLayer");
    console.log("layer", layer)
    for(let i = 0; i < layer.length; i++){
      if(layer[i]?.entities){
        layer[i].entities.removeAll();
      }
    }
    // if (layer.length > 0) {
    //   layer[0].entities.removeAll();
    // }
  }
}

export default Draw;
