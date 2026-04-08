const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../models');

const directors = [
  {
    email: 'Bogdan@mail.ru',
    password: 'Dir1_Secure2024!',
    firstName: 'Богдан',
    lastName: 'Директоров',
    phone: '+79990000001'
  },
  {
    email: 'Nikita@mail.ru',
    password: 'Dir2_Secure2024@',
    firstName: 'Никита',
    lastName: 'Руководов',
    phone: '+79990000002'
  },
  {
    email: 'Artem@mail.ru',
    password: 'Dir3_Secure2024#',
    firstName: 'Артем',
    lastName: 'Управляев',
    phone: '+79990000003'
  },
  {
    email: 'Andranik@mail.ru',
    password: 'Dir4_Secure2024$',
    firstName: 'Андраник',
    lastName: 'Главнов',
    phone: '+79990000004'
  },
  {
    email: 'Roman@mail.ru',
    password: 'Dir5_Secure2024%',
    firstName: 'Роман',
    lastName: 'Боссов',
    phone: '+79990000005'
  }
];

const managers = [
  {
    email: 'Anna@mail.ru',
    password: 'Man1_Pass2024!',
    firstName: 'Анна',
    lastName: 'Менеджерова',
    phone: '+79990000011'
  },
  {
    email: 'Elena@mail.ru',
    password: 'Man2_Pass2024@',
    firstName: 'Елена',
    lastName: 'Админова',
    phone: '+79990000012'
  },
  {
    email: 'Olga@mail.ru',
    password: 'Man3_Pass2024#',
    firstName: 'Ольга',
    lastName: 'Координатова',
    phone: '+79990000013'
  },
  {
    email: 'Tatyana@mail.ru',
    password: 'Man4_Pass2024$',
    firstName: 'Татьяна',
    lastName: 'Супервайзерова',
    phone: '+79990000014'
  },
  {
    email: 'Natalya@mail.ru',
    password: 'Man5_Pass2024%',
    firstName: 'Наталья',
    lastName: 'Контролерова',
    phone: '+79990000015'
  },
  {
    email: 'Dmitry@mail.ru',
    password: 'Man6_Pass2024^',
    firstName: 'Дмитрий',
    lastName: 'Управленцев',
    phone: '+79990000016'
  },
  {
    email: 'Andrey@mail.ru',
    password: 'Man7_Pass2024&',
    firstName: 'Андрей',
    lastName: 'Менеджеров',
    phone: '+79990000017'
  },
  {
    email: 'Alexey@mail.ru',
    password: 'Man8_Pass2024*',
    firstName: 'Алексей',
    lastName: 'Админов',
    phone: '+79990000018'
  },
  {
    email: 'Maxim@mail.ru',
    password: 'Man9_Pass2024(',
    firstName: 'Максим',
    lastName: 'Координаторов',
    phone: '+79990000019'
  },
  {
    email: 'Vladimir@mail.ru',
    password: 'Man10_Pass2024)',
    firstName: 'Владимир',
    lastName: 'Супервайзеров',
    phone: '+79990000020'
  }
];

async function initAdmins() {
  try {
    await sequelize.authenticate();
    console.log('✅ Подключение к базе данных...');

    // Создаем директоров
    console.log('\n📋 Создание аккаунтов гендиректоров...');
    for (const director of directors) {
      const existingUser = await User.findOne({ where: { email: director.email } });
      if (!existingUser) {
        const password_hash = await bcrypt.hash(director.password, 10);
        await User.create({
          email: director.email,
          password_hash,
          first_name: director.firstName,
          last_name: director.lastName,
          phone: director.phone,
          role: 'director'
        });
        console.log(`✅ Создан директор: ${director.email} | Пароль: ${director.password}`);
      } else {
        console.log(`⏭️  Уже существует: ${director.email}`);
      }
    }

    // Создаем менеджеров
    console.log('\n📋 Создание аккаунтов менеджеров...');
    for (const manager of managers) {
      const existingUser = await User.findOne({ where: { email: manager.email } });
      if (!existingUser) {
        const password_hash = await bcrypt.hash(manager.password, 10);
        await User.create({
          email: manager.email,
          password_hash,
          first_name: manager.firstName,
          last_name: manager.lastName,
          phone: manager.phone,
          role: 'manager'
        });
        console.log(`✅ Создан менеджер: ${manager.email} | Пароль: ${manager.password}`);
      } else {
        console.log(`⏭️  Уже существует: ${manager.email}`);
      }
    }

    console.log('\n✅ Все аккаунты созданы успешно!');
    console.log('\n📊 Итого создано:');
    console.log(`   - Гендиректоров: ${directors.length}`);
    console.log(`   - Менеджеров: ${managers.length}`);
    
    console.log('\n🔐 Учетные данные гендиректоров:');
    directors.forEach((d, i) => {
      console.log(`   ${i+1}. ${d.email} | Пароль: ${d.password} | Имя: ${d.firstName}`);
    });
    
    console.log('\n🔐 Учетные данные менеджеров:');
    managers.forEach((m, i) => {
      console.log(`   ${i+1}. ${m.email} | Пароль: ${m.password} | Имя: ${m.firstName}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

initAdmins();