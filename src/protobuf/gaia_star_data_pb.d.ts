import * as jspb from 'google-protobuf'



export class Star extends jspb.Message {
  getSourceId(): number;
  setSourceId(value: number): Star;

  getX(): number;
  setX(value: number): Star;

  getY(): number;
  setY(value: number): Star;

  getZ(): number;
  setZ(value: number): Star;

  getPhotGMeanMag(): number;
  setPhotGMeanMag(value: number): Star;

  getAbsoluteMagnitude(): number;
  setAbsoluteMagnitude(value: number): Star;

  getHue(): number;
  setHue(value: number): Star;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Star.AsObject;
  static toObject(includeInstance: boolean, msg: Star): Star.AsObject;
  static serializeBinaryToWriter(message: Star, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Star;
  static deserializeBinaryFromReader(message: Star, reader: jspb.BinaryReader): Star;
}

export namespace Star {
  export type AsObject = {
    sourceId: number,
    x: number,
    y: number,
    z: number,
    photGMeanMag: number,
    absoluteMagnitude: number,
    hue: number,
  }
}

export class StarCollection extends jspb.Message {
  getStarsList(): Array<Star>;
  setStarsList(value: Array<Star>): StarCollection;
  clearStarsList(): StarCollection;
  addStars(value?: Star, index?: number): Star;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StarCollection.AsObject;
  static toObject(includeInstance: boolean, msg: StarCollection): StarCollection.AsObject;
  static serializeBinaryToWriter(message: StarCollection, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StarCollection;
  static deserializeBinaryFromReader(message: StarCollection, reader: jspb.BinaryReader): StarCollection;
}

export namespace StarCollection {
  export type AsObject = {
    starsList: Array<Star.AsObject>,
  }
}

