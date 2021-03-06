/*global defineSuite*/
defineSuite([
         'Core/PolylineVolumeOutlineGeometry',
         'Core/CornerType',
         'Core/Cartesian2',
         'Core/Cartesian3',
         'Core/Cartographic',
         'Core/Ellipsoid',
         'Core/Math'
     ], function(
         PolylineVolumeOutlineGeometry,
         CornerType,
         Cartesian2,
         Cartesian3,
         Cartographic,
         Ellipsoid,
         CesiumMath) {
    "use strict";
    /*global jasmine,describe,xdescribe,it,xit,expect,beforeEach,afterEach,beforeAll,afterAll,spyOn,runs,waits,waitsFor*/

    var shape;

    beforeAll(function() {
        shape = [new Cartesian2(-10000, -10000), new Cartesian2(10000, -10000), new Cartesian2(10000, 10000), new Cartesian2(-10000, 10000)];
    });

    it('throws without polyline positions', function() {
        expect(function() {
            return new PolylineVolumeOutlineGeometry({});
        }).toThrow();
    });

    it('throws without shape positions', function() {
        expect(function() {
            return new PolylineVolumeOutlineGeometry({
                polylinePositions: [new Cartesian3()]
            });
        }).toThrow();
    });

    it('throws without 2 unique polyline positions', function() {
        expect(function() {
            return PolylineVolumeOutlineGeometry.createGeometry(new PolylineVolumeOutlineGeometry({
                polylinePositions: [new Cartesian3()],
                shapePositions: shape
            }));
        }).toThrow();
    });

    it('throws without 3 unique shape positions', function() {
        expect(function() {
            return PolylineVolumeOutlineGeometry.createGeometry(new PolylineVolumeOutlineGeometry({
                polylinePositions: [Cartesian3.UNIT_X, Cartesian3.UNIT_Y],
                shapePositions: [Cartesian2.UNIT_X, Cartesian2.UNIT_X, Cartesian2.UNIT_X]
            }));
        }).toThrow();
    });

    it('computes positions', function() {
        var ellipsoid = Ellipsoid.WGS84;
        var m = PolylineVolumeOutlineGeometry.createGeometry(new PolylineVolumeOutlineGeometry({
            polylinePositions : ellipsoid.cartographicArrayToCartesianArray([
                Cartographic.fromDegrees(90.0, -30.0),
                Cartographic.fromDegrees(90.0, -35.0)
            ]),
            shapePositions: shape,
            cornerType: CornerType.MITERED
        }));

        expect(m.attributes.position.values.length).toEqual(3 * 6 * 4);
        expect(m.indices.length).toEqual(2 * 24 + 8);
    });

    it('computes positions, clockwise shape', function() {
        var ellipsoid = Ellipsoid.WGS84;
        var m = PolylineVolumeOutlineGeometry.createGeometry(new PolylineVolumeOutlineGeometry({
            polylinePositions : ellipsoid.cartographicArrayToCartesianArray([
                Cartographic.fromDegrees(90.0, -30.0),
                Cartographic.fromDegrees(90.0, -35.0)
            ]),
            shapePositions: shape.reverse(),
            cornerType: CornerType.MITERED
        }));

        expect(m.attributes.position.values.length).toEqual(3 * 6 * 4);
        expect(m.indices.length).toEqual(2 * 24 + 8);
    });

    it('computes right turn', function() {
        var ellipsoid = Ellipsoid.WGS84;
        var m = PolylineVolumeOutlineGeometry.createGeometry(new PolylineVolumeOutlineGeometry({
            polylinePositions : ellipsoid.cartographicArrayToCartesianArray([
                Cartographic.fromDegrees(90.0, -30.0),
                Cartographic.fromDegrees(90.0, -31.0),
                Cartographic.fromDegrees(91.0, -31.0)
            ]),
            cornerType: CornerType.MITERED,
            shapePositions: shape
        }));

        expect(m.attributes.position.values.length).toEqual(3 * 5 * 4);
        expect(m.indices.length).toEqual(2 * 24);
    });

    it('computes left turn', function() {
        var ellipsoid = Ellipsoid.WGS84;
        var m = PolylineVolumeOutlineGeometry.createGeometry(new PolylineVolumeOutlineGeometry({
            polylinePositions : ellipsoid.cartographicArrayToCartesianArray([
                Cartographic.fromDegrees(90.0, -30.0),
                Cartographic.fromDegrees(90.0, -31.0),
                Cartographic.fromDegrees(89.0, -31.0)
            ]),
            cornerType: CornerType.MITERED,
            shapePositions: shape
        }));

        expect(m.attributes.position.values.length).toEqual(3 * 5 * 4);
        expect(m.indices.length).toEqual(2 * 24);
    });

    it('computes with rounded corners', function() {
        var ellipsoid = Ellipsoid.WGS84;
        var m = PolylineVolumeOutlineGeometry.createGeometry(new PolylineVolumeOutlineGeometry({
            polylinePositions : ellipsoid.cartographicArrayToCartesianArray([
                Cartographic.fromDegrees(90.0, -30.0),
                Cartographic.fromDegrees(90.0, -31.0),
                Cartographic.fromDegrees(89.0, -31.0),
                Cartographic.fromDegrees(89.0, -32.0)
            ]),
            cornerType: CornerType.ROUNDED,
            shapePositions: shape
        }));

        var corners = 90/5*2;
        expect(m.attributes.position.values.length).toEqual(3 * (corners * 4 + 7 * 4));
        expect(m.indices.length).toEqual(2 * (corners * 4 + 6 * 4 + 8));
    });

    it('computes with beveled corners', function() {
        var ellipsoid = Ellipsoid.WGS84;
        var m = PolylineVolumeOutlineGeometry.createGeometry(new PolylineVolumeOutlineGeometry({
            polylinePositions : ellipsoid.cartographicArrayToCartesianArray([
                 Cartographic.fromDegrees(90.0, -30.0),
                 Cartographic.fromDegrees(90.0, -31.0),
                 Cartographic.fromDegrees(89.0, -31.0),
                 Cartographic.fromDegrees(89.0, -32.0)
            ]),
            cornerType: CornerType.BEVELED,
            shapePositions: shape
        }));

        expect(m.attributes.position.values.length).toEqual(3 * 20 * 2);
        expect(m.indices.length).toEqual(2 * 20 * 2 + 8);
    });
});