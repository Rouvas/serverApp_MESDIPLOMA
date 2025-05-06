import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { DiseasesService } from '../../diseases/diseases.service';
import { ScenariosService } from '../../scenarios/scenarios.service';
import { SessionService } from '../../session/services/session.service';
import { UpdateUserDto } from '../../users/dto/update-user.dto';

@Injectable()
export class AdminService {
  constructor(
    private userSvc: UsersService,
    private diseasesSvc: DiseasesService,
    private scenariosSvc: ScenariosService,
    private sessionSvc: SessionService,
  ) {}

  /**
   * Пользователи
   **/

  // Получение всех юзеров для списка
  async getAllUsers() {
    return this.userSvc.findAllUsers();
  }

  // Получение юзера
  async getUser(id: string) {
    return this.userSvc.findById(id);
  }

  // Изменение пользователя
  async updateUser(id: string, user: UpdateUserDto) {
    return this.userSvc.updateUser(id, user);
  }

  /**
   * Заболевания
   **/

  // Получение всех заболеваний для списка
  async getAllDiseases() {
    return this.diseasesSvc.findAllDiseases();
  }

  // Получение заболевания
  async getDisease(id: string) {
    return this.diseasesSvc.findById(id);
  }

  /**
   * Сценарии
   **/

  // Получение всех сценариев для списка
  async getAllScenarios() {
    return this.scenariosSvc.findAll();
  }

  // Получение сценария
  async getScenario(id: string) {
    return this.scenariosSvc.findById(id);
  }

  /**
   * Сессии пользователей (JWT)
   **/

  // Получение всех сессий для списка
  async getAllSessions() {
    return this.sessionSvc.findAll();
  }
}
