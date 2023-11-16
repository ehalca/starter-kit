import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UsersRepository } from '../repositories/users.repository';
import { hash } from 'bcrypt';
import { UserListingOptions } from '../listings/users-listing.options';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { ConfigVariables } from '@ehalca/config';
import { ConfigService } from '@nestjs/config';
import { RegistrationDto } from '../dtos/registration.dto';
// import { FilesService } from '../../files/service/files.service';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository, 
    private configService: ConfigService<ConfigVariables>,
    // private filesService: FilesService
    ) {}

  public list(options: UserListingOptions) {
    return this.usersRepository.list(options);
  }

  public paginate(options: UserListingOptions) {
    return this.usersRepository.paginate(options);
  }

  public getEntity(id: string) {
    return this.usersRepository.getEntity(id);
  }

  public async getByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  public create(userData: RegistrationDto) {
    return this.usersRepository.create(userData);
  }

  public async update(id: string, userData: UpdateUserDto | Partial<User>) {
    if (userData.password) {
      userData.password = await hash(userData.password, this.configService.get('auth.passwordSalt', {infer: true})!);
    }

    return this.usersRepository.update(id, userData);
  }

  // public async uploadPhoto(id: string, fileDto: Express.Multer.File) {
  //   const file = await this.filesService.saveUserPhoto(id, fileDto);
  //   const user = await this.usersRepository.getEntity(id);
  //   if (user.profilePictureId) {
  //     await this.filesService.destroy(user.profilePictureId);
  //   }

  //   return await this.update(id, { profilePictureId: file.id });
  // }
}
