import * as _ from 'lodash';

import { User } from 'app/models/user';
export { User } from 'app/models/user';
import { Tag } from 'app/models/tag';
export { Tag } from 'app/models/tag';
export { UserTag } from 'app/models/user-tag';


export class Idea {
  constructor(public id: string,
              public title: string,
              public detail: string,
              public creator?: User,
              public tags?: Tag[]) { }
}

export class Contact {
  public from: User;
  public to: User;
  public isConfirmed: boolean;
  public created: number;
  public confirmed?: number;
  public trust: number;
  public reference: string;
  public message?: string;
  public creator?: User;
  constructor({
    from,
    to,
    creator,
    isConfirmed,
    created,
    confirmed,
    trust,
    reference,
    message
  }: {
    from: User,
    to: User,
    creator?: User,
    isConfirmed: boolean,
    created: number,
    confirmed?: number,
    trust?: number,
    reference?: string,
    message?: string
  }) {
    this.from = from;
    this.to = to;
    this.isConfirmed = isConfirmed;
    this.created = created;
    if (confirmed) {
      this.confirmed = confirmed;
    }
    if (trust && _.isString(reference)) {
      this.trust = trust;
      this.reference = reference;
    }
    if (_.isString(message)) {
      this.message = message;
    }
    if (creator) {
      this.creator = creator;
    }
  }
}

export class TagList {
  public tags: Tag[];

  constructor(tags?: Tag[]) {
    this.tags = tags || [] as Tag[];
  }

  public get tagnames(): string[] {
    return _.map(this.tags, tag => tag.id);
  }

  public find(tagname: string) {
    return this.tags.find(tag => tag.id === tagname);
  }

  public add(tagname: string) {
    // is the tag already added to the list?
    const tagIndex: number = _.findIndex(this.tags, (_tag) => {
      return _tag.id === tagname;
    });

    const isAdded: boolean = (tagIndex === -1) ? false : true;

    if (isAdded) {
      throw new Error(`The tag ${tagname} is already in the list.`);
    }

    // add tag to the list
    const tag = { id: tagname };
    this.tags.push(tag);

  }

  public get isEmpty(): boolean {
    return this.tags.length === 0;
  }

  public remove(tagname: string) {
    _.pullAllBy(this.tags, [{ tagname }], 'tagname');
  }
}

export class UserList {
  constructor(public users: User[]) {}
}

export class Message {
  public from: User;
  public to: User;
  public id: string;
  public body: string;
  public created: number;
  public read?: Boolean;

  constructor({ from, to, id, body, created, read }: { from: User, to: User, id: string, body: string, created: number, read?: Boolean }) {
    this.from = from;
    this.to = to;
    this.id = id;
    this.body = body;
    this.created = created;
    if (read) {
      this.read = read;
    }
  }

  // who is not me?
  public with(me: User): User {
    return (me.id === this.from.id) ? this.to : this.from;
  }
}

export class Notification {
  constructor (public msg: string, public type?: string, public id?: string|number, public ttl?: number) {}
}

export class Comment {
  constructor (public id: string,
               public creator: User,
               public created: number,
               public content: string,
               public reactions?: Comment[]) { }
}
