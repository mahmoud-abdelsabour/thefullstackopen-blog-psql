create table blogs (
	id serial primary key,
	author text,
	url text not null,
	title text not null,
	likes int default 0
);

insert into blogs (author, url, title, likes) values('mahmoud', 'example.com', 'test', 10);
insert into blogs (author, url, title, likes) values('ahmed', 'site.com', 'new', 50);

