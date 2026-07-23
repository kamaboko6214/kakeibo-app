alter table expenses drop constraint expenses_user_id_fkey;
alter table expenses add constraint expenses_user_id_fkey
  foreign key (user_id) references profiles(id);
