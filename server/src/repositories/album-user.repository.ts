import { Injectable } from '@nestjs/common';
import { Insertable, Kysely, Updateable } from 'kysely';
import { InjectKysely } from 'nestjs-kysely';
import { DummyValue, GenerateSql } from 'src/decorators';
import { AlbumUserRole } from 'src/enum';
import { DB } from 'src/schema';
import { AlbumUserTable } from 'src/schema/tables/album-user.table';

export type AlbumPermissionId = {
  albumId: string;
  userId: string;
};

@Injectable()
export class AlbumUserRepository {
  constructor(@InjectKysely() private db: Kysely<DB>) {}

  @GenerateSql({ params: [{ userId: DummyValue.UUID, albumId: DummyValue.UUID }] })
  create(albumUser: Insertable<AlbumUserTable>) {
    return this.db
      .insertInto('album_user')
      .values(albumUser)
      .returning(['userId', 'albumId', 'role'])
      .executeTakeFirstOrThrow();
  }

  @GenerateSql({ params: [DummyValue.UUID] })
  async createForAlbum(albumId: string): Promise<number> {
    const rows = await this.db
      .insertInto('album_user')
      .columns(['albumId', 'userId', 'role'])
      .expression((eb) =>
        eb
          .selectFrom('user')
          .crossJoin('album')
          .select((eb) => [
            eb.ref('album.id').as('albumId'),
            eb.ref('user.id').as('userId'),
            eb.val(AlbumUserRole.Editor).as('role'),
          ])
          .where('album.id', '=', albumId)
          .where('album.deletedAt', 'is', null)
          .where('user.deletedAt', 'is', null),
      )
      .onConflict((oc) => oc.columns(['albumId', 'userId']).doNothing())
      .returning('userId')
      .execute();

    return rows.length;
  }

  @GenerateSql({ params: [DummyValue.UUID] })
  async createForUser(userId: string): Promise<number> {
    const rows = await this.db
      .insertInto('album_user')
      .columns(['albumId', 'userId', 'role'])
      .expression((eb) =>
        eb
          .selectFrom('album')
          .crossJoin('user')
          .select((eb) => [
            eb.ref('album.id').as('albumId'),
            eb.ref('user.id').as('userId'),
            eb.val(AlbumUserRole.Editor).as('role'),
          ])
          .where('user.id', '=', userId)
          .where('user.deletedAt', 'is', null)
          .where('album.deletedAt', 'is', null),
      )
      .onConflict((oc) => oc.columns(['albumId', 'userId']).doNothing())
      .returning('albumId')
      .execute();

    return rows.length;
  }

  @GenerateSql({ params: [] })
  async createForAll(): Promise<number> {
    const rows = await this.db
      .insertInto('album_user')
      .columns(['albumId', 'userId', 'role'])
      .expression((eb) =>
        eb
          .selectFrom('album')
          .crossJoin('user')
          .select((eb) => [
            eb.ref('album.id').as('albumId'),
            eb.ref('user.id').as('userId'),
            eb.val(AlbumUserRole.Editor).as('role'),
          ])
          .where('user.deletedAt', 'is', null)
          .where('album.deletedAt', 'is', null),
      )
      .onConflict((oc) => oc.columns(['albumId', 'userId']).doNothing())
      .returning('albumId')
      .execute();

    return rows.length;
  }

  @GenerateSql({ params: [{ userId: DummyValue.UUID, albumId: DummyValue.UUID }, { role: AlbumUserRole.Viewer }] })
  async update({ userId, albumId }: AlbumPermissionId, dto: Updateable<AlbumUserTable>) {
    await this.db
      .updateTable('album_user')
      .set(dto)
      .where('userId', '=', userId)
      .where('albumId', '=', albumId)
      .execute();
  }

  @GenerateSql({ params: [{ userId: DummyValue.UUID, albumId: DummyValue.UUID }] })
  async delete({ userId, albumId }: AlbumPermissionId): Promise<void> {
    await this.db.deleteFrom('album_user').where('userId', '=', userId).where('albumId', '=', albumId).execute();
  }
}
